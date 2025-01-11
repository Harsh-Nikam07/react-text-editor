# React Demo Editor

## Project Information
This project is a simple rich text editor built using React and Draft.js. It allows users to format text using markdown-style commands, such as headings, bold, underline, and custom styles. The editor also supports autosaving content to local storage and displaying toast notifications for user feedback.

## How It Works
- **Editor Functionality**: The editor uses Draft.js to manage the editor state and handle text formatting. Users can type text and apply styles using specific characters:
  - `#` for headings
  - `*` for bold text
  - `**` for red text
  - `***` for underlined text
- **Autosave Feature**: The editor automatically saves content to local storage every second if there is text present.
- **Toast Notifications**: Notifications are displayed to inform users about the success or failure of saving content.

## Project Structure
frame a read me file in which add project info , how it works , structure and instructions to install

react-editor/
├── public/
│ ├── index.html
│ └── manifest.json
├── src/
│ ├── components/
│ │ ├── Toast.js
│ │ └── toast.css
│ ├── App.js
│ ├── index.js
│ └── index.css
├── tailwind.config.js
└── package.json

### Key Files
- **App.js**: Main application component that contains the editor logic.
- **Toast.js**: Component for displaying toast notifications.
- **toast.css**: Styles for the toast notifications.
- **index.js**: Entry point of the application.
- **index.css**: Global styles including Tailwind CSS imports.
- **tailwind.config.js**: Configuration for Tailwind CSS.

## Instructions to Install
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd react-editor
   ```

2. **Install Dependencies**:
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Run the Application**:
   Start the development server:
   ```bash
   npm start
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:3000` in your web browser to view the editor.

## Additional Notes
- Ensure you have the necessary permissions to access local storage in your browser.
- The project uses Tailwind CSS for styling, so you may want to familiarize yourself with its utility classes for further customization.
