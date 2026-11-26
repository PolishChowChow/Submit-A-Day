import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Input, Label, Paragraph, YStack, type InputProps } from 'tamagui';

type TextFieldProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  rules?: ControllerProps<TValues>['rules'];
} & Omit<InputProps, 'value' | 'onChangeText' | 'onBlur' | 'id'>;

/** Tamagui Input bound to react-hook-form, with label and validation message. */
export function TextField<TValues extends FieldValues>({
  control,
  name,
  label,
  rules,
  ...inputProps
}: TextFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <YStack gap="2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={!!fieldState.error}
            {...inputProps}
          />
          {fieldState.error?.message ? (
            <Paragraph size="2" color="danger">
              {fieldState.error.message}
            </Paragraph>
          ) : null}
        </YStack>
      )}
    />
  );
}
