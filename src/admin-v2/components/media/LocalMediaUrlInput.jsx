import React from 'react';
import { Images } from 'lucide-react';
import { __ } from '../../i18n/i18n';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const readyEvent = 'cci-nice-menu:local-media-library-ready';

export default function LocalMediaUrlInput({ value = '', onChange, placeholder = 'https://...' }) {
    const getAvailability = () => typeof window !== 'undefined' && Boolean(window.CCINiceMenuProMediaLibrary?.isAvailable?.());
    const [available, setAvailable] = React.useState(getAvailability);

    React.useEffect(() => {
        const refresh = () => setAvailable(getAvailability());
        window.addEventListener(readyEvent, refresh);
        refresh();
        return () => window.removeEventListener(readyEvent, refresh);
    }, []);

    const chooseImage = () => {
        window.CCINiceMenuProMediaLibrary?.open?.({
            value,
            onSelect: (url) => onChange?.(url),
        });
    };

    return (
        <div className='tw-flex tw-min-w-0 tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-items-center'>
            <Input className='tw-min-w-0 tw-flex-1' value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} />
            {available ? (
                <Button className='tw-shrink-0' type='button' variant='secondary' onClick={chooseImage}>
                    <Images aria-hidden='true' />
                    {__('Choose local image', 'cci-nice-menu')}
                </Button>
            ) : null}
        </div>
    );
}
