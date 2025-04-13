# Installation Instructions

Follow these steps to install the Kronos Stepper Form in your new project:

## Step 1: Copy the Package

Copy the entire `stepper-package` directory to your project's root directory. You can do this using Windows Explorer or by using the command line:

```
xcopy /E /I stepper-package C:\Cust_KFlow\stepper-package
```

## Step 2: Install Dependencies

Navigate to your project directory and install the required dependencies:

```
cd C:\Cust_KFlow
npm install react react-dom @supabase/supabase-js zod tailwindcss postcss autoprefixer
```

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with your actual Supabase credentials.

## Step 4: Configure Tailwind CSS

Make sure your `tailwind.config.js` file includes the paths to the stepper package components:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./stepper-package/src/**/*.{js,jsx,ts,tsx}"
  ],
  // ... rest of your configuration
}
```

## Step 5: Update Path Aliases

Make sure your `tsconfig.json` includes path aliases for imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./stepper-package/src/*"]
    }
  }
}
```

## Step 6: Import and Use the Stepper Form

In your application, import and use the stepper form:

```tsx
import StepperForm from './stepper-package/src/pages/stepper-form';

function App() {
  return (
    <div className="App">
      <StepperForm />
    </div>
  );
}

export default App;
```

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly
2. Check that path aliases are configured properly
3. Ensure Supabase environment variables are set correctly
4. Check for any console errors related to missing components or styles 