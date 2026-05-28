// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useTheme} from '@context/theme';
import {getModalHeaderOptions, useNavigationHeader} from '@hooks/navigation_header';
import {usePropsFromParams} from '@hooks/props_from_params';
import {navigateBack} from '@screens/navigation';
import InAppFilePreview from '@screens/in_app_preview';

export default function InAppPreviewRoute() {
    const theme = useTheme();

    useNavigationHeader({
        showWhenPushed: true,
        headerOptions: {
            headerTitle: 'Preview',
            ...getModalHeaderOptions(theme, navigateBack, 'close.edit_profile.button'),
        },
    });

    return (<InAppFilePreview/>);
}
