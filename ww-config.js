export default {
    type: 'wwObject',
    options: {
        sizable: true,
    },
    editor: {
        label: {
            fr: 'Image',
            en: 'Image',
        },
        icon: 'photograph',
    },
    properties: {
        url: {
            label: { en: 'Image', fr: 'Image' },
            type: 'Image',
            bindable: true,
            defaultValue: 'https://cdn.weweb.app/public/images/no_image_selected.png',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A string that represents the image url: `"https://.../.../my_image.png"`',
            },
            /* wwEditor:end */
        },
        objectFit: {
            label: {
                en: 'Fit',
            },
            type: 'TextSelect',
            options: {
                options: [
                    { value: null, default: true, label: { en: 'Fill' } },
                    { value: 'cover', label: { en: 'Cover' } },
                    { value: 'contain', label: { en: 'Contain' } },
                ],
            },
            responsive: true,
            states: true,
            classes: true,
            defaultValue: null,
        },
        overlay: {
            type: 'Color',
            label: { en: 'Overlay' },
            options: {
                nullable: true,
                gradient: true,
            },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'color',
                type: 'string',
                tooltip: 'A string that represents a color code: `"rebeccapurple" | "#00ff00" | "rgb(214, 122, 127)"`',
            },
            /* wwEditor:end */
        },
        filter: {
            type: 'CssFilters',
            label: { en: 'Filters' },
            responsive: true,
            states: true,
            bindable: true,
            classes: true,
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'filter',
                type: 'string',
                tooltip:
                    'A string that represents a filter value: `"blur(5px)" | "contrast(200%)" | "hue-rotate(90deg)"` \n\n <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/filter" target="_blank">[documentation]</a>',
            },
            /* wwEditor:end */
        },
        imageRendering: {
            label: { en: 'Rendering' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'auto', default: true, label: { en: 'Auto' } },
                    { value: 'pixelated', label: { en: 'Pixelated' } },
                    { value: 'crisp-edges', label: { en: 'Crisp edges' } },
                    { value: 'optimizeQuality', label: { en: 'Optimize Quality #non-standard' } },
                    { value: 'optimizeSpeed', label: { en: 'Optimize Speed #non-standard' } },
                    { value: 'smooth', label: { en: 'Optimize Quality #experimental' } },
                ],
            },
            responsive: true,
            states: true,
            classes: true,
            defaultValue: 'auto',
            /* wwEditor:start */
            bindingValidation: {
                cssSupports: 'image-rendering',
                type: 'string',
                tooltip:
                    'A string that represents an image-rendering css option: `"auto" | "crisp-edges" | "pixelated"` \n\n <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering" target="_blank">[documentation]</a>',
            },
            /* wwEditor:end */
        },
        alt: {
            section: 'settings',
            label: { en: 'Alt', fr: 'Alt' },
            type: 'Text',
            multiLang: true,
            bindable: true,
            options: {
                placeholder: 'Image description',
            },
            defaultValue: { en: '' },
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A string that represents the image alt: `"image description"`',
            },
            /* wwEditor:end */
        },
        loading: {
            section: 'settings',
            label: { en: 'Loading' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'lazy', label: { en: 'Lazy' }, default: true },
                    { value: 'eager', label: { en: 'Eager' } },
                ],
            },
            defaultValue: 'lazy',
        },
    },
};
