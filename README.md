# Simple Game Review Template (WIP)

This is a web application developed in Next.js for creating game reviews. The application allows users to select different category options to evaluate a game and generates a formatted output based on the selected options.

## Features

- Choose from available options for each category.
- View the selected options before generating the output.
- Generate a formatted output based on the chosen options.
- Responsive and user-friendly interface.

## Technologies Used

- **Next.js:** React framework for web development.
- **React:** JavaScript library for building user interfaces.
- **Tailwind CSS:** Utility-first CSS framework for easy styling.
- **JSON:** Data storage for category and option information.

## How to Use

1. Clone the repository: `git clone https://github.com/caiopskk/game-review-template`
2. Install dependencies: `yarn`
3. Start the development server: `yarn dev`
4. Open the browser and go to `http://localhost:3000`

## Project Structure

- **`/pages`**: Application pages, including the main page and English and Portuguese review pages.
- **`/public`**: Static resources, such as images and JSON files for review templates.
- **`/src`**: Application source code, including components and logic.

## Customization

- Add or modify categories and options in the JSON file at `/public/review_templates`.
- Adjust the application's style in the CSS file at `/styles/globals.css`.
- Expand the application's logic as needed in the components at `/src`.

## Contribution

Contributions are welcome! Feel free to open issues, propose improvements, or add new features.

## License

This project is licensed under the [MIT License](LICENSE).
