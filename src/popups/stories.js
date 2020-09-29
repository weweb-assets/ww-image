wwLib.wwPopups.addStory('WWIMAGE_ALT', {
    title: {
        en: "'Alt' text",
        fr: "Text 'Alt'",
    },
    type: 'wwPopupForm',
    storyData: {
        fields: [
            {
                label: {
                    en: "'Alt' text :",
                    fr: "Texte 'Alt' :",
                },
                type: 'text',
                key: 'alt',
                valueData: 'content.alt',
                desc: {
                    en: 'Short description of the image to help blind people and Google for SOE',
                    fr: "Déscription courte de l'image pour aider les personnes mal voyantes et Google (référencement)",
                },
            },
        ],
    },
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider',
            },
            next: false,
        },
    },
});

wwLib.wwPopups.addStory('WWIMAGE_FOCUSPOINT', {
    title: {
        en: 'Background focus point',
        fr: 'Point focal pour le font',
    },
    type: 'wwImagePopupFocusPoint',
    storyData: {},
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider',
            },
            next: false,
        },
    },
});

wwLib.wwPopups.addStory('WWIMAGE_EDIT', {
    title: {
        en: 'Edit Image',
        fr: "Editer l'image",
    },
    type: 'wwPopupList',
    buttons: null,
    storyData: {
        list: {
            EDIT_IMAGE_SELECT: {
                title: {
                    en: 'Select image',
                    fr: 'Sélectionner une image',
                },
                desc: {
                    en: 'Accepted formats (Max 5Mb) : .png, .jpg, .gif',
                    fr: 'Formats acceptés (Max 5Mb) : .png, .jpg, .gif',
                },
                icon: 'wwi wwi-image',
                next: 'IMAGE_SELECT',
            },
            EDIT_IMAGE_ALT: {
                title: {
                    en: "'Alt' text",
                    fr: "Texte 'Alt'",
                },
                desc: {
                    en: 'Description to help blind people and Google SOE',
                    fr: 'Description pour aider les personnes mal voyantes et le référencement de Google',
                },
                icon: 'wwi wwi-text',
                next: 'WWIMAGE_ALT',
            },
        },
    },
});
