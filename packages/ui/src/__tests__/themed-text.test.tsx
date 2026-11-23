import { Colors } from '../tokens/theme';
import { ThemedText } from '../primitives/themed-text';
import { renderWithProviders, screen } from '../testing/render';
import { useColorScheme } from '../hooks/use-color-scheme';

jest.mock('../hooks/use-color-scheme', () => ({ useColorScheme: jest.fn() }));

const mockedUseColorScheme = jest.mocked(useColorScheme);

describe('<ThemedText />', () => {
  beforeEach(() => {
    mockedUseColorScheme.mockReturnValue('light');
  });

  it('renders its children', async () => {
    await renderWithProviders(<ThemedText>Hello</ThemedText>);

    expect(screen.getByText('Hello')).toBeOnTheScreen();
  });

  it('uses the light text colour in light mode', async () => {
    await renderWithProviders(<ThemedText>Light</ThemedText>);

    expect(screen.getByText('Light')).toHaveStyle({ color: Colors.light.text });
  });

  it('uses the dark text colour in dark mode', async () => {
    mockedUseColorScheme.mockReturnValue('dark');

    await renderWithProviders(<ThemedText>Dark</ThemedText>);

    expect(screen.getByText('Dark')).toHaveStyle({ color: Colors.dark.text });
  });

  it('uses the requested theme colour', async () => {
    await renderWithProviders(<ThemedText themeColor="textSecondary">Muted</ThemedText>);

    expect(screen.getByText('Muted')).toHaveStyle({ color: Colors.light.textSecondary });
  });
});
