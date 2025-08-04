// Activity Loader Utility
// This script dynamically loads activities from the Activities folder

class ActivityLoader {
    constructor() {
        this.activities = [];
    }

    async scanActivitiesFolder() {
        try {
            // Dynamically discover activities by scanning the Activities folder
            const activities = await this.discoverActivities();
            
            // Load terms and setup data for each activity
            for (let activity of activities) {
                console.log(`Loading activity: ${activity.name}`);
                activity.terms = await this.loadTermsFromFile(activity.name);
                activity.setup = await this.loadSetupFromFile(activity.name);
                console.log(`Activity ${activity.name} loaded:`, activity);
            }

            return activities;
        } catch (error) {
            console.error('Error loading activities:', error);
            return [];
        }
    }

    async discoverActivities() {
        const response = await fetch('activities.json');
        const data = await response.json();
        console.log('Loaded activities from JSON file:', data.activities);
        return data.activities;
    }

    formatDisplayName(folderName) {
        // Convert folder name to display name
        // e.g., "human body drag and drop" -> "Human Body Drag and Drop"
        // Decode URL-encoded characters first
        const decodedName = decodeURIComponent(folderName);
        return decodedName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async loadTermsFromFile(activityName) {
        // Find the activity in the loaded data to get the correct terms file path
        const activities = await this.discoverActivities();
        const activity = activities.find(a => a.name === activityName);
        
        if (!activity || !activity.termsFile) {
            throw new Error(`Activity ${activityName} not found or missing terms file`);
        }
        
        console.log(`Loading terms from: ${activity.termsFile}`);
        const response = await fetch(activity.termsFile);
        const termsText = await response.text();
        
        const terms = termsText
            .split('\n')
            .map(term => term.trim())
            .filter(term => term.length > 0);
        
        console.log(`Loaded ${terms.length} terms from ${activity.termsFile}:`, terms);
        return terms;
    }

    async loadSetupFromFile(activityName) {
        // Find the activity in the loaded data to get the correct setup file path
        const activities = await this.discoverActivities();
        const activity = activities.find(a => a.name === activityName);
        
        if (!activity || !activity.setupFile) {
            console.log(`No setup file configured for ${activityName}, using empty setup`);
            return { dropZones: [] };
        }
        
        console.log(`Loading setup from: ${activity.setupFile}`);
        const response = await fetch(activity.setupFile);
        
        if (!response.ok) {
            console.log(`No setup file found at ${activity.setupFile}, using empty setup`);
            return { dropZones: [] };
        }
        
        const setupData = await response.json();
        console.log(`Loaded setup data from ${activity.setupFile}:`, setupData);
        return setupData;
    }


}

// Instructions for adding new activities:
/*
To add a new activity:

1. Create a new folder in the Activities directory with the activity name
2. Add an image file (jpg, png, etc.) to the folder (name it image.jpg, main.png, etc.)
3. Create a terms.txt file with one term per line
4. The activity will be automatically detected and loaded!

Example folder structure:
Activities/
  your-activity-name/
    image.jpg (or any image file)
    terms.txt
    your-activity-name_setup.json (optional - created when you save setup)
*/

// Export for use in the main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityLoader;
} 