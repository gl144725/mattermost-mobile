// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from 'expo-router';
import RNFS from 'react-native-fs';

import {useTheme} from '@context/theme';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {isPreviewableInApp, parseCSV, type PreviewType} from '@utils/file/preview';
import {typography} from '@utils/typography';

import CSVPreview from './csv_preview';
import MarkdownPreview from './markdown_preview';

type Params = {
    filePath: string;
    fileName?: string;
    fileId?: string;
    title?: string;
    mimeType?: string;
    onDismiss?: () => void;
};

const getStyles = makeStyleSheetFromTheme((theme: Theme) => ({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.centerChannelBg,
    },
    loadingText: {
        marginTop: 12,
        color: changeOpacity(theme.centerChannelColor, 0.56),
        ...typography('Body', 75),
    },
    error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: theme.centerChannelBg,
    },
    errorTitle: {
        color: theme.centerChannelColor,
        ...typography('Heading', 200, 'SemiBold'),
    },
    errorText: {
        marginTop: 8,
        color: changeOpacity(theme.centerChannelColor, 0.56),
        ...typography('Body', 100),
        textAlign: 'center',
    },
}));

const InAppFilePreview = () => {
    const navigation = useNavigation();
    const theme = useTheme();
    const styles = getStyles(theme);

    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewType, setPreviewType] = useState<PreviewType>(null);

    // Read route params
    const params = (navigation as any).getState?.()?.routes?.find(
        (r: any) => r.name === 'in_app_preview',
    )?.params as Params | undefined;

    const filePath = params?.filePath || '';
    const fileName = params?.fileName || params?.title || 'file';
    const fileId = params?.fileId || '';

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const text = await RNFS.readFile(filePath, 'utf8');
                if (cancelled) return;

                setContent(text);

                const type = isPreviewableInApp({
                    name: fileName,
                    mime_type: params?.mimeType,
                });
                setPreviewType(type);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to read file');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (filePath) {
            load();
        } else {
            setError('No file path provided');
            setLoading(false);
        }

        return () => { cancelled = true; };
    }, [filePath, fileName]);

    // Set navigation title
    useEffect(() => {
        navigation.setOptions({title: fileName});
    }, [fileName, navigation]);

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size='large' color={changeOpacity(theme.centerChannelColor, 0.64)}/>
                <Text style={styles.loadingText}>{'Loading...'}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.error}>
                <Text style={styles.errorTitle}>{'Preview Failed'}</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!previewType) {
        return (
            <View style={styles.error}>
                <Text style={styles.errorTitle}>{'Unsupported File'}</Text>
                <Text style={styles.errorText}>
                    {`${fileName} is not supported for in-app preview.`}
                </Text>
            </View>
        );
    }

    switch (previewType) {
        case 'markdown':
            return <MarkdownPreview content={content} title={fileName}/>;
        case 'csv': {
            const csvData = parseCSV(content);
            return <CSVPreview data={csvData}/>;
        }
        default:
            return null;
    }
};

export default InAppFilePreview;
