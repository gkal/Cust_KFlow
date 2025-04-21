# Kronos Web Application

## Environment Variables Setup

This application uses environment variables for configuration. Create a `.env.local` file in the root directory with the following variables:

```
# Email Configuration
NEXT_PUBLIC_RESEND_API_KEY=your_resend_api_key
```

### Important Notes about Environment Variables

1. For client-side access (browser), environment variables must be prefixed with `NEXT_PUBLIC_`.
2. The application will use fallback values if environment variables are not set.
3. Never commit sensitive API keys to your repository.
4. For production, set these environment variables on your hosting platform.

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application. 