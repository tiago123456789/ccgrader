import { Input } from "../ui/input";
import { Label } from "../ui/label";


interface ResizeEffectProps {
    onChange(type: string, key: string, value: string): void;
    data: { [key: string]: string };
}

const TYPE = 'resize';

export default function ResizeEffect({ onChange, data }: ResizeEffectProps) {
    return (
        <>
            <div key={TYPE} className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold capitalize">Resize Settings</h3>

                <div key={'width'} className="space-y-2">
                    <Label htmlFor={'width'}>Width</Label>
                    <Input
                        id={'width'}
                        type={'number'}
                        placeholder={`Enter width`}
                        value={data.width}
                        onChange={(e) => {
                            onChange(TYPE, 'width', e.target.value);
                        }}
                        required={true}
                        className="w-full"
                    />
                </div>

                <div key={'height'} className="space-y-2">
                    <Label htmlFor={'height'}>Height</Label>
                    <Input
                        id={'height'}
                        type={'number'}
                        placeholder={`Enter height`}
                        value={data.height}
                        onChange={(e) => {
                            onChange(TYPE, 'height', e.target.value);
                        }}
                        required={true}
                        className="w-full"
                    />
                </div>
            </div>
        </>
    )
}