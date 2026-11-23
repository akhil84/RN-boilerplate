import { View, type ViewProps, type ViewStyle } from 'react-native';

import { Spacing } from '../tokens/theme';

export type StackProps = ViewProps & {
  direction?: 'row' | 'column';
  /** Space between children, as a spacing token (ADR-0017). */
  gap?: keyof typeof Spacing;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
};

/** Lays out children in a row or column with token spacing — instead of ad-hoc margins. */
export function Stack({
  direction = 'column',
  gap = 'three',
  align,
  justify,
  wrap,
  style,
  ...rest
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: Spacing[gap],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}
