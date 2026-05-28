// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useTheme} from '@context/theme';
import type {CSVData} from '@utils/file/preview';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

type Props = {
    data: CSVData;
};

const HEADER_BG_COLOR = 'rgba(63,67,80,0.12)';
const BORDER_COLOR = 'rgba(63,67,80,0.16)';
const CELL_MIN_WIDTH = 80;
const CELL_PADDING_H = 10;
const CELL_PADDING_V = 6;

const getStyles = makeStyleSheetFromTheme((theme: Theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.centerChannelBg,
    },
    scrollH: {
        flex: 1,
    },
    scrollV: {
        paddingHorizontal: 8,
        paddingTop: 12,
        paddingBottom: 32,
    },
    headerCell: {
        backgroundColor: HEADER_BG_COLOR,
        borderRightWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: BORDER_COLOR,
        paddingHorizontal: CELL_PADDING_H,
        paddingVertical: CELL_PADDING_V,
        minWidth: CELL_MIN_WIDTH,
        flexShrink: 1,
        justifyContent: 'center',
    },
    headerText: {
        ...typography('Body', 75, 'SemiBold'),
        color: theme.centerChannelColor,
    },
    cell: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: BORDER_COLOR,
        paddingHorizontal: CELL_PADDING_H,
        paddingVertical: CELL_PADDING_V,
        minWidth: CELL_MIN_WIDTH,
        flexShrink: 1,
        justifyContent: 'center',
    },
    cellText: {
        ...typography('Body', 75),
        color: theme.centerChannelColor,
    },
    noData: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: theme.centerChannelBg,
    },
    noDataText: {
        color: changeOpacity(theme.centerChannelColor, 0.48),
        ...typography('Body', 100),
        textAlign: 'center',
    },
}));

const CSVPreview = ({data}: Props) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme);

    if (data.headers.length === 0) {
        return (
            <View style={styles.noData}>
                <Text style={styles.noDataText}>{'No data in CSV file'}</Text>
            </View>
        );
    }

    // Calculate column widths: max content width per column
    const colCount = data.headers.length;
    const colWidths = new Array(colCount).fill(0);

    // Measure header widths (approx: char count * fontSize * 0.6)
    data.headers.forEach((h, i) => {
        colWidths[i] = Math.max(colWidths[i], h.length * 8 + CELL_PADDING_H * 2);
    });
    data.rows.forEach((row) => {
        row.forEach((cell, i) => {
            if (i < colCount) {
                colWidths[i] = Math.max(colWidths[i], cell.length * 8 + CELL_PADDING_H * 2);
            }
        });
    });

    // Ensure min width
    const finalWidths = colWidths.map((w) => Math.max(w, CELL_MIN_WIDTH));

    const renderCell = (text: string, index: number, isHeader: boolean) => (
        <View
            key={index}
            style={[isHeader ? styles.headerCell : styles.cell, {width: finalWidths[index]}]}
        >
            <Text
                style={isHeader ? styles.headerText : styles.cellText}
                numberOfLines={3}
            >
                {text}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, {paddingBottom: insets.bottom}]}>
            <ScrollView
                horizontal={true}
                style={styles.scrollH}
                showsHorizontalScrollIndicator={true}
            >
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.scrollV}
                    nestedScrollEnabled={true}
                >
                    {/* Header row */}
                    <View style={{flexDirection: 'row'}}>
                        {data.headers.map((h, i) => renderCell(h, i, true))}
                    </View>
                    {/* Data rows */}
                    {data.rows.map((row, rowIndex) => (
                        <View key={rowIndex} style={{flexDirection: 'row'}}>
                            {row.map((cell, cellIndex) =>
                                cellIndex < colCount ? renderCell(cell, cellIndex, false) : null,
                            )}
                        </View>
                    ))}
                </ScrollView>
            </ScrollView>
        </View>
    );
};

export default CSVPreview;
