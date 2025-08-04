# Dynamic Drag & Drop Activity App

A flexible, web-based drag-and-drop activity app that supports multiple activities with configurable drop zones. Perfect for educational purposes and can be easily hosted on free services like GitHub Pages or Netlify.

## 🎯 Features

- **Dynamic Activity Loading**: Load activities from the Activities folder
- **Setup Mode**: Configure drop zones before starting activities
- **Interactive Drag & Drop**: Students drag labels to the correct areas
- **Visual Feedback**: Immediate feedback for correct and incorrect placements
- **Progress Tracking**: Real-time progress bar showing completion status
- **Score Submission**: Automatic score submission to Google Apps Script (Google Sheets integration)
- **Student Data Collection**: Tracks student names, scores, completion times, and submission timestamps
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **No Backend Required**: Fully static - works with just HTML, CSS, and JavaScript
- **Local Storage**: Saves zone configurations for each activity
- **Fallback System**: Local storage backup when Google Apps Script is unavailable

## 🚀 Quick Start

1. **Download/Clone** the project files
2. **Open** `index.html` in any modern web browser
3. **Select an activity** from the dropdown
4. **Configure drop zones** in setup mode
5. **Start the activity** and begin learning!

### 📊 Score Collection Setup (Optional)

To automatically collect student scores:
1. **Read** `GOOGLE_APPS_SCRIPT_SETUP.md` for detailed instructions
2. **Set up** the Google Apps Script using `google-apps-script.gs`
3. **Update** the Google Apps Script URL in `script.js`
4. **Test** the integration by completing an activity and submitting a score

## 📁 Project Structure

```
drag-and-drop/
├── index.html              # Main webpage
├── styles.css              # Styling and animations
├── script.js               # Main application logic
├── activity-loader.js      # Activity loading utility
├── google-apps-script.gs   # Google Apps Script backend
├── GOOGLE_APPS_SCRIPT_SETUP.md  # Google Apps Script setup guide
├── README.md               # This file
└── Activities/             # Activity data folder
    └── human body drag and drop/
        ├── human_body.jpg  # Activity image
        ├── terms.txt       # Terms for the activity
        └── human body drag and drop_setup.json  # Saved setup data (optional)
```

## 🎨 Adding New Activities

### Step 1: Create Activity Folder
Create a new folder in the `Activities` directory with your activity name:
```
Activities/
└── your-activity-name/
```

### Step 2: Add Activity Files
1. **Add an image** (jpg, png, etc.) to your activity folder
2. **Create terms.txt** with one term per line:
```
term1
term2
term3
term4
```

### Step 3: Update Activity Configuration (Optional)
The app will automatically detect and load your activity! However, if you want to customize the display name or add more activities, you can edit the `scanActivitiesFolder()` method in `activity-loader.js`.

**Important**: The app now dynamically loads terms from the `terms.txt` file, so you only need to update the text file when adding or removing terms!

### Step 4: Test Your Activity
1. Open `index.html` in a browser
2. Select your new activity from the dropdown
3. Configure drop zones in setup mode
4. Start the activity!

## 🛠️ Using the App

### Activity Selection
- Choose an activity from the dropdown menu
- Click "Load Activity" to proceed

### Setup Mode
- **Add Drop Zone**: Create new drop zones on the image
- **Configure Zones**: Click on zones to configure their position and assigned terms
- **Position Zones**: Set X/Y coordinates (percentages) and size (pixels)
- **Assign Terms**: Link each zone to a specific term from your list
- **Start Activity**: Begin the drag-and-drop activity once all terms are assigned

### Activity Mode
- **Drag Labels**: Drag terms to the correct drop zones
- **Visual Feedback**: See immediate feedback for correct/incorrect placements
- **Progress Tracking**: Monitor your completion progress
- **Reset**: Start over at any time

## 🎯 Zone Configuration

### Position Settings
- **X Position**: Distance from left edge of image (0-100%)
- **Y Position**: Distance from top edge of image (0-100%)
- **Width**: Zone width in pixels (20-200px)
- **Height**: Zone height in pixels (20-200px)

### Tips for Positioning
- Use percentages for X/Y to maintain positioning across different screen sizes
- Make zones large enough to be easily targeted
- Position zones over the actual areas where terms should be placed

## 🌐 Deployment

### GitHub Pages
1. Create a new GitHub repository
2. Upload all project files
3. Go to Settings → Pages
4. Select "Deploy from a branch" → "main"
5. Your app will be available at `https://yourusername.github.io/repository-name`

### Netlify
1. Create a Netlify account
2. Drag and drop your project folder to Netlify
3. Your app will be deployed instantly with a unique URL

### Any Web Server
Simply upload the files to any web hosting service that supports static files.

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, animations, and responsive design
- **JavaScript (ES6+)**: Drag & drop functionality using HTML5 Drag & Drop API
- **Local Storage**: Saves zone configurations for each activity
- **No Frameworks**: Pure vanilla JavaScript for maximum compatibility

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Key Features Implementation
1. **Dynamic Activity Loading**: Scans Activities folder and loads configurations
2. **Setup Mode**: Interactive zone configuration with visual feedback
3. **Drag & Drop**: Uses native HTML5 Drag & Drop API
4. **Local Storage**: Persists zone configurations between sessions
5. **Responsive Design**: Flexbox and media queries for mobile compatibility

## 🎓 Educational Use Cases

This app is perfect for:

- **Anatomy Classes**: Label body parts, organs, or systems
- **Geography**: Label countries, states, or landmarks on maps
- **Science**: Label parts of cells, plants, or chemical structures
- **History**: Label historical events on timelines
- **Language Learning**: Match words to pictures or translations
- **Art History**: Label parts of paintings or sculptures
- **Engineering**: Label components of machines or structures

## 📊 Student Data Collection

The app automatically collects and submits the following student data:

- **Student Name**: Name entered by the student
- **Assignment Name**: Name of the activity/assignment
- **Score**: Number of correct placements and percentage
- **Completion Time**: Time taken to complete the activity
- **Submission Timestamp**: Exact time when score was submitted
- **Activity Details**: Start time, end time, and formatted duration

This data can be automatically sent to:
- **Google Sheets**: For easy spreadsheet analysis
- **Airtable**: For database-style organization
- **Notion**: For note-taking and project management
- **Any other NoCodeAPI provider**: For custom integrations

## 🔧 Troubleshooting

### Common Issues

1. **Activities not loading**: Check that the activity folder structure is correct
2. **Images not displaying**: Verify image file paths in activity-loader.js
3. **Terms not loading**: Ensure terms.txt file exists and is properly formatted
4. **Zones not saving**: Check that localStorage is enabled in your browser
5. **Drag and drop not working**: Ensure JavaScript is enabled

### Debug Mode
Open the browser console (F12) to see helpful debug messages and track the app's functionality.

### Adding Activities Manually
If automatic scanning doesn't work, you can manually add activities by editing the `scanActivitiesFolder()` method in `activity-loader.js`.

## 📝 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed for educational purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation
- Add new activities

## 📞 Support

If you need help or have questions:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all files are in the correct directory structure
4. Try opening the app in a different browser
5. Verify that your activity folder structure matches the expected format

---

**Happy Learning! 🎓** 