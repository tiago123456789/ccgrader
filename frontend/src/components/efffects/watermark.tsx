import { Input } from "../ui/input";
import { Label } from "../ui/label";


interface ResizeEffectProps {
    onChange(type: string, key: string, value: string): void;
    data: { [key: string]: string };
}

const TYPE = 'watermark';

const POSITION_OPTIONS = [
    { label: 'North', value: 'north' },
    { label: 'South', value: 'south' },
    { label: 'East', value: 'east' },
    { label: 'West', value: 'west' },
    { label: 'Northwest', value: 'northwest' },
    { label: 'Southeast', value: 'southeast' },
    { label: 'Southwest', value: 'southwest' },
];


export default function WatermarkEffect({ onChange, data }: ResizeEffectProps) {
    return (
        <>
            <div key={TYPE} className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold capitalize">Watermark Settings</h3>

                <div key={TYPE} className="space-y-4 p-4 border rounded-lg">
                    <div key={'position'} className="space-y-2">
                        <Label htmlFor={'position'}>Position</Label>
                        <select
                            id={'position'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={data.position || ''}
                            onChange={(e) => {
                                onChange(TYPE, 'position', e.target.value);
                            }}
                            required={true}
                        >
                            <option value="">Select position</option>
                            {POSITION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                            id="imageUrl"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={data.watermarkFileUrl || ''}
                            onChange={(e) => onChange(TYPE, 'watermarkFileUrl', e.target.value)}
                            required
                            className="w-full"
                        />
                        <p className="text-sm text-slate-500">
                            Enter a valid image URL (JPG and PNG)
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}