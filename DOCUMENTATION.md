# Conceptual understanding:


## Architecture and Separation of Concerns:
   1. Presentation Layer - responsible for rendering data to users and capturing user input through the visual interface
   2. Application Layer - responsible for core processes, workflows and determines how data is created, validated, and transformed according to business use cases and rules
   3. Data Access Layer - responsible for data fetching and storage
   4. Infrastructure Layer - responsible for providing access to external systems, frameworks and hardware


🍕 Pizza shop as an Eg:
presentation layer is the shop window and counter where customers place their orders and watch the pizzas being boxed.

application layer is the head chef who reads each pizza order, follows the recipe, and tells the kitchen staff what to do (e.g., "add cheese," "bake at 220°C for 10 minutes").

data access layer is the pantry and fridge where all ingredients live (cheese, dough, toppings). When the chef needs something, they send someone to fetch it.

infrastructure layer is the building itself (walls, power, water, ovens)
                       In Code:
                       UI → Order counter

                       Business Logic → Recipe and cooking

                       Data Access → Fetching inventory

                       Database → Storage for ingredients/recipes

# Separation of Concerns has 2 Processes - Increasing Cohesion and Reducing Coupling
In Code:
 Coupling - How tightly modules rely on each other
       High coupling = Classes or modules are tangled and cant work alone.
       Low coupling = Modules talk through clean, minimal interfaces.
 Cohesion - How focused a module is on one specific task
       High cohesion = A module/class does one job well and all parts work toward the same purpose.
       Low cohesion = It has mixed responsibilities that don't belong together.

🍕 Analogy:
 If the cashier has to constantly enter the kitchen to tell the chef what to do or ask where the cheese is stored → That's high coupling. One part can't function without digging into another part's business.
 If the kitchen is responsible for making pizza, pasta, answering phone calls, and managing accounts… → That is low cohesion. It is doing too many unrelated things.


 High Cohesion - If the cashier simply sends the order to the kitchen, and the kitchen does its thing
 Low Coupling - If the kitchen only cooks, and the front desk only handles orders… → That is high cohesion. Each part has a focused responsibility.

# Recipe Finder Application Documentation

## Architecture and Component Structure

The Recipe Finder application follows a modern React architecture with Next.js, implementing clean separation of concerns through a layered approach. This section explains the architecture in detail for developers new to these concepts.

### Understanding the Layered Architecture

The application is structured into four distinct layers, each with specific responsibilities:

#### 1. Presentation Layer (UI Components)
This layer contains all the React components that users directly interact with. Located in the `components/` directory, these components:

- **Handle rendering**: Transform data into visual elements
- **Capture user input**: Process clicks, form submissions, and other interactions
- **Manage component-specific state**: Handle UI-specific states like form inputs or toggle states
- **Communicate with the Application Layer**: Call functions provided by context or hooks

**Key Components:**
- `RecipeCard.tsx`: Displays individual recipe information
  \`\`\`tsx
  // Example of a presentation component
  export function RecipeCard({ recipe }: RecipeCardProps) {
    // Component renders UI based on props received
    return (
      <Card className="recipe-card overflow-hidden border-2 border-white bg-card">
        {/* UI rendering logic */}
      </Card>
    );
  }
  \`\`\`

- `SearchBar.tsx`: Provides input field for user queries
- `SearchResults.tsx`: Organizes and displays recipe cards
- `FilterSidebar.tsx`: Offers filtering options
- `ThemeToggle.tsx`: Controls theme switching

#### 2. Application Layer (Business Logic)
This layer manages the application's core logic and state. It's implemented through React Context and custom hooks in the `context/` and `hooks/` directories:

- **Manages global state**: Stores and updates application-wide data
- **Implements business rules**: Contains logic for searching, filtering, and data processing
- **Coordinates between UI and Data layers**: Acts as a mediator

**Key Files:**
- `search-context.tsx`: Central state management for search functionality
  \`\`\`tsx
  // Example of application layer logic
  export function SearchProvider({ children }: SearchProviderProps) {
    // State management
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Business logic
    const performSearch = useCallback(async (searchQuery: string) => {
      // Logic for searching recipes
      // Coordinates between UI and Data layers
    }, [/* dependencies */]);
    
    return (
      <SearchContext.Provider value={{ recipes, loading, performSearch }}>
        {children}
      </SearchContext.Provider>
    );
  }
  \`\`\`

#### 3. Data Access Layer (API Integration)
This layer handles all external data operations. Located in the `lib/` directory, it:

- **Fetches data**: Makes API calls to external services
- **Processes responses**: Transforms API responses into application-friendly formats
- **Handles errors**: Manages API-related errors and edge cases

**Key Files:**
- `use-deepseek-api.ts`: Custom hook for API interactions
  \`\`\`tsx
  // Example of data access layer
  export function useDeepseekApi() {
    // Data fetching logic
    const searchRecipes = useCallback(async (query: string) => {
      // API call implementation
      const response = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
        // ...
      });
      // Process response
      return data;
    }, []);
    
    return { searchRecipes };
  }
  \`\`\`

#### 4. Infrastructure Layer (Configuration & Services)
This layer provides foundational services and configuration. Located in `app/api/` and configuration files:

- **API routes**: Server-side endpoints
- **Configuration**: Environment variables, settings
- **Cross-cutting concerns**: Rate limiting, error handling, logging

**Key Files:**
- `app/api/search/route.ts`: Backend API endpoint
- `lib/rate-limiter.ts`: Rate limiting implementation

### Component Communication Patterns

Components in the application communicate through several patterns:

1. **Props Passing**: Parent components pass data to children
   \`\`\`tsx
   <RecipeCard recipe={recipeData} />
   \`\`\`

2. **Context Consumption**: Components access shared state
   \`\`\`tsx
   const { recipes, loading } = useSearch();
   \`\`\`

3. **Event Handlers**: Components respond to user interactions
   \`\`\`tsx
   <Button onClick={handleSearch}>Search</Button>
   \`\`\`

4. **Custom Hooks**: Components use specialized hooks for logic
   \`\`\`tsx
   const { searchRecipes } = useDeepseekApi();
   \`\`\`

## Data Flow and State Management

Understanding how data flows through the application is crucial for new developers. This section explains the complete data lifecycle from user input to rendered output.

### State Management with React Context

The application uses React Context API for global state management, which provides a way to share state across components without prop drilling.

#### Context Creation and Structure

The main context is defined in `search-context.tsx`:

\`\`\`tsx
// 1. Define the shape of the context
interface SearchContextType {
  query: string;
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  selectedFilters: string[];
  setQuery: (query: string) => void;
  performSearch: (searchQuery: string) => Promise<void>;
  setSelectedFilters: (filters: string[]) => void;
}

// 2. Create the context with default values
const SearchContext = createContext<SearchContextType>({
  query: "",
  recipes: [],
  loading: false,
  // ... other default values
});

// 3. Create a custom hook for easy consumption
export const useSearch = () => useContext(SearchContext);
\`\`\`

#### Provider Implementation

The `SearchProvider` component initializes and manages the state:

\`\`\`tsx
export function SearchProvider({ children }: SearchProviderProps) {
  // State declarations
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  // ... other state variables
  
  // API hook integration
  const { searchRecipes, parseRecipeData } = useDeepseekApi();
  
  // Business logic functions
  const performSearch = useCallback(async (searchQuery: string) => {
    // Implementation details
  }, [dependencies]);
  
  // Create value object with memoization to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    query, recipes, loading, error, hasSearched, selectedFilters,
    setQuery, performSearch, setSelectedFilters
  }), [query, recipes, loading, error, hasSearched, selectedFilters, performSearch]);
  
  // Provide the context to children
  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}
\`\`\`

#### Context Consumption

Components consume the context using the custom hook:

\`\`\`tsx
function SearchBar() {
  // Access context values and functions
  const { setQuery, performSearch, loading } = useSearch();
  
  // Component implementation using context values
}
\`\`\`

### Complete Data Flow Walkthrough

Let's trace the complete flow of data when a user searches for recipes:

1. **User Input Capture**:
   - User types "vegetarian pasta" in the SearchBar component
   - Local state in SearchBar tracks the input value
   \`\`\`tsx
   const [inputValue, setInputValue] = useState("");
   const handleInputChange = (e) => setInputValue(e.target.value);
   \`\`\`

2. **Search Initiation**:
   - User clicks the search button or presses Enter
   - SearchBar component calls the performSearch function from context
   \`\`\`tsx
   const handleSearch = () => {
     setQuery(inputValue);
     performSearch(inputValue);
   };
   \`\`\`

3. **Context State Update**:
   - SearchProvider updates loading state to true
   - Combines search query with any selected filters
   \`\`\`tsx
   setLoading(true);
   let combinedQuery = searchQuery;
   if (selectedFilters.length > 0) {
     const filterTerms = selectedFilters.join(", ");
     combinedQuery = `${searchQuery} with dietary preferences: ${filterTerms}`;
   }
   \`\`\`

4. **API Request**:
   - SearchProvider calls searchRecipes from useDeepseekApi
   - useDeepseekApi makes a fetch request to the /api/search endpoint
   \`\`\`tsx
   const data = await searchRecipes(combinedQuery);
   \`\`\`

5. **Server-Side Processing**:
   - Next.js API route (/api/search) receives the request
   - Applies rate limiting to prevent abuse
   - Calls the Deepseek API with the formatted prompt
   - Processes and validates the response
   - Returns the result to the client

6. **Response Processing**:
   - useDeepseekApi receives and returns the API response
   - SearchProvider parses the response into Recipe objects
   \`\`\`tsx
   const parsedRecipes = parseRecipeData(data.result);
   \`\`\`

7. **State Update**:
   - SearchProvider updates the recipes state with the parsed data
   - Sets loading to false and hasSearched to true
   \`\`\`tsx
   setRecipes(parsedRecipes);
   setHasSearched(true);
   setLoading(false);
   \`\`\`

8. **UI Re-render**:
   - React detects the state changes in context
   - SearchResults component re-renders with the new recipes
   - Each recipe is rendered as a RecipeCard component

9. **Error Handling**:
   - If any step fails, error state is updated
   - UI displays appropriate error messages
   \`\`\`tsx
   catch (err) {
     setError(err instanceof Error ? err.message : "An unknown error occurred");
     setRecipes([]);
   }
   \`\`\`

### State Management Best Practices

The application implements several best practices for efficient state management:

1. **State Colocation**: Keeping state as close as possible to where it's used
   \`\`\`tsx
   // Local component state for UI concerns
   const [inputValue, setInputValue] = useState("");
   
   // Global context state for shared data
   const { recipes, loading } = useSearch();
   \`\`\`

2. **Memoization**: Preventing unnecessary re-renders
   \`\`\`tsx
   // Using useMemo for context value
   const contextValue = useMemo(() => ({
     // values
   }), [dependencies]);
   
   // Using useCallback for functions
   const performSearch = useCallback(() => {
     // implementation
   }, [dependencies]);
   \`\`\`

3. **Immutable Updates**: Creating new state objects instead of mutating existing ones
   \`\`\`tsx
   // Creating a new array instead of modifying the existing one
   setSelectedFilters([...selectedFilters, newFilter]);
   \`\`\`

4. **Derived State**: Calculating values from existing state
   \`\`\`tsx
   // Derived state example
   const hasResults = recipes.length > 0;
   const showNoResultsMessage = hasSearched && !hasResults && !loading;
   \`\`\`

## TypeScript Integration

TypeScript provides static typing to JavaScript, helping catch errors during development. Here's how TypeScript is used in the application:

### Type Definitions

The application defines clear interfaces for data structures:

\`\`\`tsx
// Recipe type definition
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  imageUrl: string;
  dietaryInfo: string[];
  recipeType?: string; // New field for recipe categorization
}

// Component props type definition
interface RecipeCardProps {
  recipe: Recipe;
}
\`\`\`

### Type Safety in Components

Components use TypeScript for prop validation:

\`\`\`tsx
// Type-safe component
export function RecipeCard({ recipe }: RecipeCardProps) {
  // TypeScript ensures recipe has the correct structure
  const { title, description } = recipe;
  
  return (/* component JSX */);
}
\`\`\`

### Generic Types

The application uses generic types for reusable components:

\`\`\`tsx
// Generic type example
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyH1({ children, className }: TypographyProps) {
  return <h1 className={cn("text-4xl font-bold", className)}>{children}</h1>;
}
\`\`\`

### Type Assertions and Guards

The code uses type assertions and guards for runtime safety:

\`\`\`tsx
// Type guard example
if (Array.isArray(parsedData)) {
  // TypeScript knows parsedData is an array here
} else {
  // TypeScript knows parsedData is not an array here
}

// Type assertion example
const responseText = data.choices?.[0]?.message?.content as string;
\`\`\`

## Next.js App Router Architecture

The application uses Next.js App Router, which is a file-system based router built on top of React Server Components.

### File-Based Routing

Routes are defined by the file structure in the `app` directory:

\`\`\`
app/
├── api/
│   └── search/
│       └── route.ts  # Handles /api/search requests
├── globals.css       # Global styles
├── layout.tsx        # Root layout wrapper
├── loading.tsx       # Loading UI
└── page.tsx          # Main page component (/)
\`\`\`

### Server and Client Components

Next.js 13+ introduces a distinction between Server and Client Components:

1. **Server Components** (default):
   - Render on the server
   - Cannot use hooks or browser APIs
   - Can directly access backend resources
   - Reduce client-side JavaScript

2. **Client Components** (marked with "use client" directive):
   \`\`\`tsx
   "use client"
   
   import { useState } from "react";
   
   export function ClientComponent() {
     // Can use hooks and browser APIs
     const [count, setCount] = useState(0);
     
     return (/* component JSX */);
   }
   \`\`\`

### API Routes

Next.js API routes provide a way to build API endpoints as part of your application:

\`\`\`tsx
// app/api/search/route.ts
export async function POST(req: Request) {
  // Handle POST requests to /api/search
  const body = await req.json();
  // Process the request
  return NextResponse.json({ result: data });
}
\`\`\`

## React Hooks in Depth

The application makes extensive use of React hooks. Here's a detailed explanation of how they're used:

### useState

Used for component-local state management:

\`\`\`tsx
// Basic useState example
const [inputValue, setInputValue] = useState("");

// useState with complex initial state
const [recipes, setRecipes] = useState<Recipe[]>([]);
\`\`\`

### useCallback

Used to memoize functions to prevent unnecessary re-renders:

\`\`\`tsx
const performSearch = useCallback(async (searchQuery: string) => {
  // Implementation that doesn't change between renders
  // unless dependencies change
}, [searchRecipes, parseRecipeData, selectedFilters]);
\`\`\`

### useMemo

Used to memoize computed values:

\`\`\`tsx
const contextValue = useMemo(() => ({
  query, recipes, loading, error, hasSearched, selectedFilters,
  setQuery, performSearch, setSelectedFilters
}), [query, recipes, loading, error, hasSearched, selectedFilters, performSearch]);
\`\`\`

### useContext

Used to consume React context:

\`\`\`tsx
// Custom hook wrapping useContext
export const useSearch = () => useContext(SearchContext);

// Usage in components
const { recipes, loading } = useSearch();
\`\`\`

### useEffect

Used for side effects in components:

\`\`\`tsx
// Sync local state with props
useEffect(() => {
  setLocalSelectedFilters(selectedFilters);
}, [selectedFilters]);
\`\`\`

### Custom Hooks

The application defines custom hooks to encapsulate reusable logic:

\`\`\`tsx
// Custom hook for API interactions
export function useDeepseekApi() {
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRecipes = useCallback(async (query: string) => {
    // Implementation
  }, []);
  
  return { isLoading, searchRecipes };
}
\`\`\`

## Tailwind CSS and Styling Approach

The application uses Tailwind CSS for styling, which is a utility-first CSS framework.

### Utility Classes

Components use Tailwind's utility classes for styling:

\`\`\`tsx
<div className="flex flex-col items-center w-full max-w-6xl mx-auto">
  {/* Content */}
</div>
\`\`\`

### Component Styling

The application combines Tailwind with component-based styling:

\`\`\`tsx
// Card component with Tailwind classes
<Card className="recipe-card overflow-hidden border-2 border-white bg-card">
  {/* Card content */}
</Card>
\`\`\`

### Dark Mode Support

The application supports dark mode using Tailwind's dark mode variant:

\`\`\`tsx
// Dark mode responsive styling
<span className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
  {tag}
</span>
\`\`\`

### Class Name Utilities

The `cn` utility function combines class names conditionally:

\`\`\`tsx
import { cn } from "@/lib/utils";

// Conditional class application
<button
  className={cn(
    "base-class",
    isActive && "active-class",
    isDisabled && "disabled-class"
  )}
>
  Click me
</button>
\`\`\`

## Error Handling Strategies

The application implements comprehensive error handling at multiple levels:

### API Route Error Handling

Server-side error handling in API routes:

\`\`\`tsx
try {
  // API logic
} catch (error) {
  console.error("API error:", error);
  return NextResponse.json(
    { error: "Error message" },
    { status: 500 }
  );
}
\`\`\`

### Client-Side Error Handling

Error handling in React components:

\`\`\`tsx
try {
  await performSearch(query);
} catch (err) {
  setError(err instanceof Error ? err.message : "Unknown error");
}
\`\`\`

### Error Boundaries

While not explicitly implemented, React error boundaries could be added:

\`\`\`tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
\`\`\`

### User-Facing Error Messages

The UI displays user-friendly error messages:

\`\`\`tsx
{error && (
  <div className="error-container">
    <h2>Error</h2>
    <p>{error}</p>
  </div>
)}
\`\`\`

## Performance Optimization Techniques

The application implements several performance optimizations:

### Memoization

Using React's memoization hooks to prevent unnecessary re-renders:

\`\`\`tsx
// Memoized function
const handleSearch = useCallback(() => {
  // Implementation
}, [dependencies]);

// Memoized value
const filteredRecipes = useMemo(() => {
  return recipes.filter(/* filtering logic */);
}, [recipes, filterCriteria]);
\`\`\`

### Code Splitting

Next.js automatically implements code splitting for pages and dynamic imports.

### Optimized Rendering

Conditional rendering to avoid unnecessary DOM updates:

\`\`\`tsx
// Only render when needed
{hasSearched && recipes.length > 0 && (
  <RecipeList recipes={recipes} />
)}
\`\`\`

### Image Optimization

Using Next.js Image component for optimized images:

\`\`\`tsx
<Image
  src={recipe.imageUrl || "/placeholder.svg"}
  alt={title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
/>
\`\`\`

## Accessibility Considerations

The application implements several accessibility features:

### Semantic HTML

Using appropriate HTML elements:

\`\`\`tsx
<h1>Page Title</h1>
<button>Click Me</button>
<nav>Navigation</nav>
\`\`\`

### ARIA Attributes

Adding ARIA attributes for screen readers:

\`\`\`tsx
<button
  aria-label="Search for recipes"
  aria-pressed={isSearching}
>
  Search
</button>
\`\`\`

### Keyboard Navigation

Ensuring keyboard navigation works:

\`\`\`tsx
// Handle keyboard events
const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    handleSearch();
  }
};
\`\`\`

### Focus Management

Managing focus for interactive elements:

\`\`\`tsx
<input
  ref={inputRef}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>
\`\`\`

## Testing Strategies

While tests aren't included in the codebase, here are recommended testing approaches:

### Unit Testing

Testing individual functions and components:

\`\`\`tsx
// Example Jest test for a utility function
test('truncateString should truncate long strings', () => {
  expect(truncateString('Hello World', 5)).toBe('Hello...');
});
\`\`\`

### Component Testing

Testing React components with React Testing Library:

\`\`\`tsx
// Example component test
test('SearchBar should call performSearch when submitted', () => {
  const mockPerformSearch = jest.fn();
  render(<SearchBar performSearch={mockPerformSearch} />);
  
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'pasta' } });
  fireEvent.click(screen.getByRole('button', { name: /search/i }));
  
  expect(mockPerformSearch).toHaveBeenCalledWith('pasta');
});
\`\`\`

### Integration Testing

Testing multiple components working together:

\`\`\`tsx
// Example integration test
test('searching should display results', async () => {
  render(<SearchProvider><App /></SearchProvider>);
  
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'pasta' } });
  fireEvent.click(screen.getByRole('button', { name: /search/i }));
  
  await waitFor(() => {
    expect(screen.getByText('Recipes for You')).toBeInTheDocument();
    expect(screen.getAllByTestId('recipe-card')).toHaveLength(4);
  });
});
\`\`\`

## Unique Recipe Generation

The application implements a sophisticated approach to ensure diverse and unique recipe results for each search. This section explains how this works in simple terms.

### The Challenge

When searching for recipes, we want to show users a variety of options that match their criteria. However, AI models like the one we use (Deepseek) might sometimes generate similar recipes or focus too much on one type of dish.

### Our Solution: Combined Approach

We use a combination of three techniques to ensure recipe diversity:

1. **Explicit Instructions**: We directly tell the AI to create unique recipes
2. **Category Guidance**: We ask for different types of recipes (breakfast, lunch, dinner, appetizer)
3. **Diversity Dimensions**: We specify exactly how recipes should differ (ingredients, cooking methods, cuisines)

### How It Works (For Non-Programmers)

Imagine you're asking a chef to create four different pasta dishes. Instead of just saying "make me four pasta dishes," you might say:

"Make me four unique pasta dishes:
- One should use tomato sauce and be Italian style
- One should use cream sauce and be French inspired
- One should be a cold pasta salad
- One should be a baked pasta dish"

This is similar to what our application does with the AI model.

### The Code Explained

When a user searches for recipes, our application:

1. **Takes the user's search query** (e.g., "vegetarian dinner ideas")

2. **Sends special instructions to the AI** along with the query:
   \`\`\`
   Generate 4 UNIQUE recipes that:
   - Use different main ingredients
   - Use different cooking methods
   - Represent different cuisine styles
   - Cover different meal types
   \`\`\`

3. **Adds a structure for the AI to follow**, including a special "recipeType" field that helps categorize each recipe

4. **Processes the response** to display diverse recipes to the user

### Benefits for Users

This approach provides several benefits:

- **More Choices**: Users see a wider variety of recipes that match their criteria
- **Better Discovery**: Users can explore different cooking styles and meal types
- **Improved Relevance**: Each recipe is still tailored to the user's dietary needs and preferences

### Technical Implementation

For developers, the implementation involves:

1. **Enhanced Prompting**: The system message to the AI model includes specific diversity requirements

2. **Structured Output**: We require the AI to include a "recipeType" field in each recipe

3. **Parameter Tuning**: We use a balanced temperature setting (0.7) and a presence penalty (0.3) to encourage creativity without going off-topic

4. **Single API Call**: All this happens in one API call, making it efficient and cost-effective

## 1. Project Overview and Tech Stack

### Project Purpose

Recipe Finder is a web application that allows users to search for recipes based on dietary requirements and cuisine preferences. The application provides a clean, responsive interface for discovering recipes tailored to specific needs.

### Key Features

- Dynamic recipe search based on dietary requirements and cuisine preferences
- Responsive recipe card display with images and key information
- Theme switching between light and dark modes
- Detailed error handling and user feedback
- Real-time image loading with fallback mechanisms
- Unique recipe generation with diverse meal types and cooking styles

### Technology Stack

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Next.js | 15.0.0 | React framework for server-side rendering and API routes | [Next.js Docs](https://nextjs.org/docs) |
| React | 18.2.0 | UI library for building component-based interfaces | [React Docs](https://react.dev/) |
| TypeScript | 5.0.0 | Static typing for JavaScript | [TypeScript Docs](https://www.typescriptlang.org/docs/) |
| Tailwind CSS | 3.3.0 | Utility-first CSS framework | [Tailwind Docs](https://tailwindcss.com/docs) |
| Shadcn UI | 0.5.0 | Component library built on Radix UI | [Shadcn UI Docs](https://ui.shadcn.com/) |
| next-themes | 0.2.1 | Theme management for Next.js | [next-themes GitHub](https://github.com/pacocoursey/next-themes) |
| Deepseek API | - | AI-powered recipe generation | [Deepseek API Docs](https://api.deepseek.com/docs) |
| Lucide React | 0.294.0 | Icon library | [Lucide React Docs](https://lucide.dev/docs/lucide-react) |
| Unsplash | - | High-quality food images | [Unsplash API](https://unsplash.com/documentation) |

## 2. Setup and Installation

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher) or yarn (v1.22.0 or higher)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
DEEPSEEK_API_KEY=your_deepseek_api_key
\`\`\`

### Installation Steps

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/recipe-finder.git
cd recipe-finder
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

## 3. Directory Structure

\`\`\`
recipe-finder/
├── app/                    # Next.js App Router files
│   ├── api/                # API routes
│   │   └── search/         # Search API endpoint
│   │       └── route.ts    # Search route handler
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   ├── loading.tsx         # Loading component
│   └── page.tsx            # Main page component
├── components/             # React components
│   ├── ui/                 # Shadcn UI components
│   ├── recipe-card.tsx     # Recipe card component
│   ├── search-bar.tsx      # Search input component
│   ├── search-results.tsx  # Search results component
│   └── theme-toggle.tsx    # Theme toggle component
├── context/                # React context providers
│   └── search-context.tsx  # Search context provider
├── hooks/                  # Custom React hooks
│   └── use-mobile.tsx      # Mobile detection hook
├── lib/                    # Utility functions and services
│   ├── rate-limiter.ts     # API rate limiting utility
│   ├── use-deepseek-api.ts # Deepseek API utility
│   └── utils.ts            # General utilities
├── public/                 # Static assets
├── styles/                 # Additional styles
│   └── globals.css         # Global styles
├── .env.local              # Environment variables (not in repo)
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
\`\`\`

### File Naming Conventions

- React components: PascalCase (e.g., `RecipeCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSearch.ts`)
- Utilities: camelCase (e.g., `rateLimit.ts`)
- Context providers: PascalCase with `Provider` suffix (e.g., `SearchProvider.tsx`)
- API routes: kebab-case (e.g., `search-recipes.ts`)

## 4. API Reference

### Internal API Routes

#### Search API

**Endpoint**: `/api/search`

**Method**: `POST`

**Request Body**:
\`\`\`typescript
{
  query: string; // Search query containing dietary requirements and cuisine preferences
}
\`\`\`

**Success Response** (200 OK):
\`\`\`typescript
{
  result: string; // JSON string containing recipe data
}
\`\`\`

**Error Responses**:
- 400 Bad Request: Invalid or missing query
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: API error or parsing failure

**Rate Limiting**:
- 5 requests per minute per IP address
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### External APIs

#### Deepseek API

**Endpoint**: `https://api.deepseek.com/v1/chat/completions`

**Method**: `POST`

**Headers**:
\`\`\`
Content-Type: application/json
Authorization: Bearer {DEEPSEEK_API_KEY}
\`\`\`

**Request Body**:
\`\`\`typescript
{
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens: number;
  temperature: number;
  presence_penalty: number; // Added for recipe diversity
}
\`\`\`

**Response**:
\`\`\`typescript
{
  choices: Array<{
    message: {
      content: string; // JSON string containing recipe data
    }
  }>
}
\`\`\`

#### Unsplash API (via URL pattern)

**URL Pattern**: `https://source.unsplash.com/featured/?food,{recipe-name}`

This URL pattern is used to fetch relevant food images from Unsplash based on the recipe name.

## 5. Component and Hook Catalog

### Components

#### SearchBar

**Purpose**: Provides an input field and button for users to enter search queries.

**Props**: None (uses context for state)

**Usage**:
\`\`\`tsx
<SearchBar />
\`\`\`

#### SearchResults

**Purpose**: Displays search results as recipe cards or appropriate messages for loading/error states.

**Props**: None (uses context for state)

**Usage**:
\`\`\`tsx
<SearchResults />
\`\`\`

#### RecipeCard

**Purpose**: Displays a single recipe with image, title, description, and dietary information.

**Props**:
\`\`\`typescript
{
  recipe: {
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    imageUrl: string;
    dietaryInfo: string[];
    recipeType?: string; // New field for recipe categorization
  }
}
\`\`\`

**Usage**:
\`\`\`tsx
<RecipeCard recipe={recipeData} />
\`\`\`

#### ThemeToggle

**Purpose**: Allows users to switch between light, dark, and system themes.

**Props**: None (uses next-themes)

**Usage**:
\`\`\`tsx
<ThemeToggle />
\`\`\`

### Hooks

#### useSearch

**Purpose**: Provides access to search state and functions from the SearchContext.

**Returns**:
\`\`\`typescript
{
  query: string;
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  setQuery: (query: string) => void;
  performSearch: (searchQuery: string) => Promise<void>;
}
\`\`\`

**Usage**:
\`\`\`tsx
const { recipes, loading, error, performSearch } = useSearch();
\`\`\`

#### useDeepseekApi

**Purpose**: Encapsulates API calls to the Deepseek API and handles response parsing.

**Returns**:
\`\`\`typescript
{
  isLoading: boolean;
  searchRecipes: (query: string) => Promise<{ result: string }>;
  parseRecipeData: (jsonString: string) => Recipe[];
}
\`\`\`

**Usage**:
\`\`\`tsx
const { searchRecipes, parseRecipeData } = useDeepseekApi();
\`\`\`

## 6. State Management Strategy

### Global State

The application uses React Context for global state management. The main context is `SearchContext`, which manages:

- Current search query
- Search results (recipes)
- Loading state
- Error state
- Search history flag

### Context Provider Hierarchy

\`\`\`
<ThemeProvider>
└── <SearchProvider>
    └── Application components
\`\`\`

### Updating Context Values

The `SearchProvider` component provides functions to update context values:

- `setQuery`: Updates the current search query
- `performSearch`: Executes a search and updates results, loading, and error states

### Consuming Context Values

Components consume context values using the `useSearch` hook:

\`\`\`tsx
const { query, recipes, loading, error, performSearch } = useSearch();
\`\`\`

### Local State

Components use local state for UI-specific concerns:

- `SearchBar` uses local state for input value
- `RecipeCard` uses local state for image loading
- `ThemeToggle` uses state from `next-themes` for theme management

## 7. Testing Strategy

### Testing Tools

- Jest: JavaScript testing framework
- React Testing Library: Testing utilities for React components
- MSW (Mock Service Worker): API mocking for tests

### Test Types

#### Unit Tests

- Test individual functions and hooks in isolation
- Mock dependencies and context providers
- Focus on input/output and state changes

Example unit test for a utility function:
\`\`\`tsx
// utils.test.ts
import { cleanJsonResponse } from '../lib/utils';

describe('cleanJsonResponse', () => {
  it('should remove markdown code blocks', () => {
    const input = '\`\`\`json\n{"key": "value"}\n\`\`\`';
    const expected = '{"key": "value"}';
    expect(cleanJsonResponse(input)).toBe(expected);
  });
});
\`\`\`

#### Component Tests

- Test components with their immediate dependencies
- Mock context providers and API calls
- Focus on rendering, user interactions, and state updates

Example component test:
\`\`\`tsx
// SearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../components/search-bar';
import { SearchProvider } from '../context/search-context';

describe('SearchBar', () => {
  it('should call performSearch when the button is clicked', () => {
    const mockPerformSearch = jest.fn();
    jest.mock('../context/search-context', () => ({
      useSearch: () => ({
        performSearch: mockPerformSearch,
        loading: false,
      }),
    }));

    render(
      <SearchProvider>
        <SearchBar />
      </SearchProvider>
    );

    const input = screen.getByPlaceholderText(/enter dietary requirements/i);
    fireEvent.change(input, { target: { value: 'vegan italian' } });
    
    const button = screen.getByText(/enter/i);
    fireEvent.click(button);

    expect(mockPerformSearch).toHaveBeenCalledWith('vegan italian');
  });
});
\`\`\`

#### Integration Tests

- Test multiple components working together
- Use real context providers with mocked API calls
- Focus on user flows and data passing between components

#### End-to-End Tests

- Test the entire application in a browser-like environment
- Use Cypress or Playwright
- Focus on critical user journeys

### Test Coverage

Aim for:
- 80%+ coverage for utility functions and hooks
- 70%+ coverage for components
- Critical user flows covered by integration tests

## 8. CI/CD and Deployment

### CI Pipeline

The CI pipeline runs on GitHub Actions and includes:

1. **Linting**: ESLint and TypeScript type checking
2. **Testing**: Unit, component, and integration tests
3. **Build**: Production build of the application

### CD Pipeline

The CD pipeline deploys the application to Vercel on every push to the `main` branch.

### Deployment Steps

1. Push changes to the `main` branch
2. GitHub Actions runs the CI pipeline
3. On success, Vercel automatically deploys the application

## 9. Code Style Guidelines

### ESLint

The application uses ESLint for code linting. The ESLint configuration is located in `.eslintrc.js`.

### Prettier

The application uses Prettier for code formatting. The Prettier configuration is located in `.prettierrc.js`.

### TypeScript

The application uses TypeScript for static typing. All code should be written in TypeScript.

### React

The application uses React for building the UI. All components should be written as functional components with hooks.

### Tailwind CSS

The application uses Tailwind CSS for styling. All styling should be done using Tailwind CSS utility classes.

## 10. Contribution Guidelines

### Branching

Create a new branch for each feature or bug fix. The branch name should be descriptive and follow the format `feature/feature-name` or `bugfix/bug-name`.

### Committing

Commit messages should be clear and concise. The commit message should follow the format `feat: add new feature` or `fix: fix bug`.

### Pull Requests

Create a pull request to merge your changes into the `main` branch. The pull request should include a description of the changes and a link to the relevant issue.

## 11. Future Enhancements

### User Authentication

Implement user authentication to allow users to save their favorite recipes and dietary preferences.

### Recipe Submission

Allow users to submit their own recipes to the application.

### Advanced Search

Implement advanced search options, such as searching by ingredients or cuisine.

### Meal Planning

Implement a meal planning feature to allow users to plan their meals for the week.

## 12. Troubleshooting

### API Errors

If you encounter API errors, check the following:

- The Deepseek API key is valid
- The API endpoint is correct
- The request body is valid
- The rate limit has not been exceeded

### Build Errors

If you encounter build errors, check the following:

- All dependencies are installed
- The TypeScript configuration is valid
- The ESLint configuration is valid
- The Prettier configuration is valid

### Deployment Errors

If you encounter deployment errors, check the following:

- The Vercel configuration is valid
- The environment variables are set correctly
- The build process is successful

## 13. Unique Recipe Generation

### Challenge

One challenge in recipe recommendation systems is generating diverse and unique recipes that still match the user's search criteria. If the AI model's temperature (randomness) is set too low, it might return very similar recipes. If set too high, recipes might not match the user's search criteria.

### Our Solution

The Recipe Finder application implements a combined approach to ensure unique recipe generation:

#### 1. Enhanced Prompt Engineering

We use explicit instructions in our prompt to the AI model:

\`\`\`typescript
const messages = [
  {
    role: "system",
    content: `You are a recipe recommendation assistant. Generate EXACTLY 4 UNIQUE meal planning recipes...
    
    IMPORTANT: Each recipe MUST be distinctly different from the others in terms of:
    - Main ingredients (e.g., if one uses chicken, others should use different proteins)
    - Cooking methods (e.g., baking, frying, steaming, etc.)
    - Cuisine styles (e.g., Italian, Asian, Mediterranean, etc.)
    - Meal types (e.g., breakfast, lunch, dinner, appetizer)
    ...`
  }
]
\`\`\`

This explicitly tells the AI to create recipes that differ across multiple dimensions.

#### 2. Recipe Type Categorization

We added a `recipeType` field to our recipe schema:

\`\`\`typescript
export interface Recipe {
  // Other fields...
  recipeType?: string; // breakfast, lunch, dinner, appetizer
}
\`\`\`

This encourages the AI to categorize each recipe differently and helps users understand the intended meal context.

#### 3. Optimized Sampling Parameters

We carefully tuned the AI model parameters:

\`\`\`typescript
{
  temperature: 0.7, // Balanced for uniqueness without being too random
  presence_penalty: 0.6, // Discourages repetition of content
}
\`\`\`

These settings provide a good balance between creativity and relevance.

#### 4. Validation

We validate the API response to ensure we received enough unique recipes:

\`\`\`typescript
// Check if we have enough unique recipes (at least 3 out of 4)
if (parsedResponse.length < 3) {
  return NextResponse.json(
    { error: "Could not generate enough unique recipes..." },
    { status: 500 }
  );
}
\`\`\`

### How It Works for Non-Technical Users

When you search for recipes:

1. You enter your dietary requirements and preferences (e.g., "vegetarian pasta dishes")
2. Our system asks the AI to create four distinctly different recipes matching your criteria
3. The AI creates recipes that vary in:
   - Main ingredients (e.g., spinach pasta, mushroom pasta, tomato pasta)
   - Cooking methods (e.g., baked, stovetop, one-pot)
   - Cuisine styles (e.g., Italian, Mediterranean, Asian fusion)
   - Meal types (e.g., lunch, dinner, appetizer)
4. Each recipe is labeled with its meal type (breakfast, lunch, dinner, or appetizer)
5. You get a diverse set of recipe options that all match your original search

This approach ensures you get varied recipe suggestions while still meeting your dietary needs and preferences.
