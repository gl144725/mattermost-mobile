// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import FormattedMarkdownText from '@components/formatted_markdown_text';
import {useTheme} from '@context/theme';
import {typography} from '@utils/typography';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

type Props = {
    content: string;
    title: string;
};

const getStyles = makeStyleSheetFromTheme((theme: Theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.centerChannelBg,
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.centerChannelBg,
    },
    error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: theme.centerChannelBg,
    },
    errorText: {
        color: changeOpacity(theme.centerChannelColor, 0.64),
        ...typography('Body', 100),
        textAlign: 'center',
    },
}));

const MarkdownPreview = ({content, title}: Props) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme);

    return (
        <View style={[styles.container, {paddingBottom: insets.bottom}]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{paddingBottom: 32}}
                showsVerticalScrollIndicator={true}
            >
                <FormattedMarkdownText
                    value={content}
                    baseTextStyle={{
                        color: theme.centerChannelColor,
                        ...typography('Body', 100),
                    }}
                    channelId=''
                />
            </ScrollView>
        </View>
    );
};

export default MarkdownPreview;
