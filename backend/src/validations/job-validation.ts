import * as yup from 'yup';
import { GRAYSCALE, RESIZE, WATERMARK } from '../types/change.type';

const changeSchema = yup.object().shape({
  action: yup.string().oneOf([GRAYSCALE, RESIZE, WATERMARK]).required(),
  width: yup.number().positive().optional(),
  height: yup.number().positive().optional(),
  position: yup.string().optional(),
  watermarkFileUrl: yup.string().url().optional(),
});

export const createJobSchema = yup.object().shape({
  url: yup.string().url().required('URL is required and must be valid'),
  changesToApply: yup.array()
    .of(changeSchema)
    .min(1, 'At least one change must be specified')
});
