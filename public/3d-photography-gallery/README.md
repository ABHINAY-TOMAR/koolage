
# 3D Photography Gallery

An immersive 3D gallery designed to showcase photography with smooth, infinite scrolling, dynamic shaders, and interactive navigation. This project is built using React, Three.js (via `@react-three/fiber`), and styled with Tailwind CSS.

## Features

- **Immersive 3D Experience**: Displays images on planes in a 3D space, creating a sense of depth.
- **Infinite Scroll**: Seamlessly loops through a collection of images as the user scrolls.
- **Dynamic Effects**: Utilizes custom shaders for beautiful fade, blur, and cloth-like waving effects during interaction.
- **Interactive Navigation**: Users can navigate the gallery using the mouse wheel, arrow keys, or touch gestures.
- **Hover Interactions**: Images gently wave like a flag when the user hovers over them.
- **Auto-Play Mode**: The gallery automatically and gently scrolls after a period of inactivity.
- **Customizable**: Component props allow for easy customization of speed, visible items, and effect thresholds.
- **Graceful Fallback**: Includes a simple grid-based fallback for browsers that do not support WebGL.

## Component: `InfiniteGallery`

The core of this project is the `InfiniteGallery` component located in `components/ui/3d-gallery-photography.tsx`. It handles all the logic for rendering the 3D scene, managing user interactions, and applying visual effects.

### Key Props

| Prop           | Type                               | Default                                                | Description                                                                                             |
| -------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `images`       | `ImageItem[]`                      | `[]`                                                   | An array of image objects (`{ src: string; alt?: string }`) or strings to display in the gallery.       |
| `speed`        | `number`                           | `1`                                                    | A multiplier for the scroll speed. Higher values result in faster navigation.                           |
| `visibleCount` | `number`                           | `8`                                                    | The number of image planes to render in the scene at one time.                                          |
| `fadeSettings` | `FadeSettings`                     | `{ fadeIn: ..., fadeOut: ... }`                        | An object to configure the start and end points of the fade-in/fade-out effects based on depth.         |
| `blurSettings` | `BlurSettings`                     | `{ blurIn: ..., blurOut: ..., maxBlur: ... }`          | An object to configure the blur-in/blur-out effects and the maximum blur intensity.                     |
| `className`    | `string`                           | `''`                                                   | Optional CSS classes to apply to the main container element.                                            |
| `style`        | `React.CSSProperties`              | `{}`                                                   | Optional inline styles to apply to the main container.                                                  |

## Project Setup

This project is set up as a modern frontend application without a traditional bundler, using `es-module-shims` and an import map to handle dependencies directly in the browser.

### Prerequisites

-   A modern web browser that supports ES Modules and WebGL.
-   A local web server to serve the `index.html` file.

### Running Locally

1.  **Clone the Repository** (or ensure all files are in the same directory).
2.  **Serve the Files**: You need a simple local server to avoid CORS issues with module loading. You can use any static server, such as the `Live Server` extension in VS Code, or run a command-line server.
    
    For example, using Python:
    ```bash
    python -m http.server
    ```
    
    Or with Node.js (if you have `serve` installed):
    ```bash
    npx serve .
    ```

3.  **Open in Browser**: Navigate to the local server's address (e.g., `http://localhost:8000`) in your browser.

## How to Use the `InfiniteGallery` Component

You can integrate the `InfiniteGallery` component into any React application.

**Example Usage (`App.tsx`):**

```tsx
import React from 'react';
import InfiniteGallery from "./components/ui/3d-gallery-photography";

export default function App() {
  const myImages = [
    { src: "path/to/image1.jpg", alt: "Description 1" },
    { src: "path/to/image2.jpg", alt: "Description 2" },
    // ... more images
  ];

  return (
    <main className="min-h-screen w-full bg-black">
      <InfiniteGallery
        images={myImages}
        speed={1.2}
        visibleCount={12}
        className="h-screen w-full"
      />
    </main>
  );
}
```

## Technologies Used

-   **React**: For building the user interface.
-   **TypeScript**: For type safety and improved developer experience.
-   **Three.js**: The underlying 3D graphics library.
-   **@react-three/fiber**: A React renderer for Three.js, making it easy to create 3D scenes declaratively.
-   **@react-three/drei**: A collection of useful helpers and abstractions for `@react-three/fiber`.
-   **Tailwind CSS**: For styling the overlay UI components.
-   **GLSL**: For the custom vertex and fragment shaders that create the unique visual effects.
