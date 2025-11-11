import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose
} from './ui/drawer';
import type EffectData from '@/types/effect-data';
import ResizeEffect from './efffects/resize';
import GrayscaleEffect from './efffects/grayscale';
import WatermarkEffect from './efffects/watermark';
import { Alert, AlertDescription } from './ui/alert';

interface EffectConfig {
  type: string;
  fields?: {
    label: string;
    name: string;
    type: string;
    required: boolean;
    options?: { label: string; value: string }[];
  }[];
}

const effectConfigs: EffectConfig[] = [
  {
    type: 'grayscale',
  },
  {
    type: 'resize',
    fields: [
      {
        label: 'Width',
        name: 'width',
        type: 'number',
        required: true,
      },
      {
        label: 'Height',
        name: 'height',
        type: 'number',
        required: true,
      },
    ],
  },
  {
    type: 'watermark',
    fields: [
      {
        label: 'Position',
        name: 'position',
        type: 'select',
        required: true,
        options: [
          { label: 'North', value: 'north' },
          { label: 'South', value: 'south' },
          { label: 'East', value: 'east' },
          { label: 'West', value: 'west' },
          { label: 'Northwest', value: 'northwest' },
          { label: 'Northeast', value: 'northeast' },
          { label: 'Southeast', value: 'southeast' },
          { label: 'Southwest', value: 'southwest' },
        ],
      },
      {
        label: 'Watermark image URL',
        name: 'watermarkFileUrl',
        type: 'url',
        required: true,
      },
    ],
  },
];

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { imageUrl: string; effects: EffectData[] }) => void;
  error?: string | null; 
}

export function CreateJobModal({ open, onOpenChange, onSubmit, error }: CreateJobModalProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEffects, setSelectedEffects] = useState<EffectData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!imageUrl.trim()) {
        return;
      }
  
      setIsSubmitting(true);

      await onSubmit?.({ imageUrl: imageUrl.trim(), effects: selectedEffects });

      setSelectedEffects([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (type: string, key: string, value: string) => {
    setSelectedEffects(prev =>
      prev.map(e =>
        e.action === type ? { ...e, [key]: value } : e
      )
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[600px] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Create New Image Processing Job</DrawerTitle>
          <DrawerDescription>
            Add an image URL to create a new processing job. The image will be processed according to your configured settings.
          </DrawerDescription>
          <DrawerClose />
        </DrawerHeader>

        <form onSubmit={handleSubmit}>
          <DrawerBody className="space-y-6">
            {error && <Alert className="text-red-500" variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>}

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-sm text-slate-500">
                Enter a valid image URL (JPG and PNG)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Effects to apply</Label>
              <div className="flex flex-wrap gap-2">
                {effectConfigs.map((config) => (
                  <Button
                    key={config.type}
                    type="button"
                    variant={selectedEffects.some(e => e.action === config.type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedEffects(prev => {
                        const exists = prev.some(e => e.action === config.type);
                        if (exists) {
                          return prev.filter(e => e.action !== config.type);
                        } else {
                          return [...prev, { action: config.type }];
                        }
                      });
                    }}
                  >
                    {config.type.charAt(0).toUpperCase() + config.type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {selectedEffects.map((effect) => {
              if (effect.action === 'resize') {
                return <ResizeEffect
                  key={effect.action} onChange={onChange}
                  data={effect} />;
              }

              if (effect.action === 'grayscale') {
                return <GrayscaleEffect
                  key={effect.action}
                />;
              }

              if (effect.action === 'watermark') {
                return <WatermarkEffect
                  key={effect.action}
                  onChange={onChange}
                  data={effect} />;
              }

              return <></>;
            })}

          </DrawerBody>

          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!imageUrl.trim() || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating Job...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Job
                </>
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}