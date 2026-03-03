export default () => ({
  cloud: {
    enabled: false,
  },
  upload: {
    config: {
      provider: 'local',
      sizeLimit: 10 * 1024 * 1024,
      breakpoints: {
        xlarge: 1920,
        large: 1280,
        medium: 960,
        small: 640,
        xsmall: 320,
      },
    },
  },
});
