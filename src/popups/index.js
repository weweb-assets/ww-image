import wwImagePopupFocusPoint from './wwImagePopupFocusPoint.vue';
wwLib.wwPopups.addPopup('wwImagePopupFocusPoint', wwImagePopupFocusPoint);

import './stories';

export default async function openPopup({ isBackground, content }) {
    const additionalOptions = {};
    if (!isBackground) {
        additionalOptions.WWIMAGE_FOCUSPOINT = {
            title: {
                en: 'Background focus point',
                fr: 'Point focal pour font',
            },
            desc: {
                en: 'Select a focus point that should always be visible.',
                fr: 'Selectionner un point focal qui doit toujours être visible.',
            },
            icon: 'wwi wwi-show',
            next: 'WWIMAGE_FOCUSPOINT',
        };
    }

    const result = await wwLib.wwPopups.open({ firstPage: 'WWIMAGE_EDIT', data: { additionalOptions, content } });
    if (!result) return null;

    let update = {};
    if (result.image !== undefined) {
        update.src = result.image;
    }
    if (result.alt !== undefined) {
        update.alt = result.alt;
    }
    if (result.focusPoint !== undefined) {
        update.focusPoint = result.focusPoint;
    }

    return update;
}
