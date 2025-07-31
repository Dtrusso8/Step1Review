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
        try {
            // Try to fetch a list of activities from the server
            // This would require a server-side endpoint, but for now we'll use a fallback approach
            const response = await fetch('Activities/');
            
            if (response.ok) {
                // Parse the directory listing to find activity folders
                const html = await response.text();
                const activities = this.parseDirectoryListing(html);
                return activities;
            } else {
                // Fallback: manually scan known activities
                return this.scanKnownActivities();
            }
        } catch (error) {
            console.log('Could not fetch directory listing, using fallback:', error);
            return this.scanKnownActivities();
        }
    }

    async parseDirectoryListing(html) {
        // Parse HTML directory listing to extract folder names
        const activities = [];
        const folderRegex = /href="([^"]+\/)"/g;
        let match;
        
        while ((match = folderRegex.exec(html)) !== null) {
            const folderName = match[1].replace('/', '');
            if (folderName && folderName !== '..' && folderName !== '.') {
                // Decode URL-encoded folder names
                const decodedFolderName = decodeURIComponent(folderName);
                activities.push({
                    name: decodedFolderName,
                    displayName: this.formatDisplayName(decodedFolderName),
                    image: null // Will be set after finding the image file
                });
            }
        }
        
        // Now find image files for each discovered activity
        for (let activity of activities) {
            const imageFile = await this.findImageFile(activity.name);
            if (imageFile) {
                activity.image = `Activities/${activity.name}/${imageFile}`;
            }
        }
        
        return activities;
    }

    parseImageFromDirectory(html) {
        // Parse HTML directory listing to find any image file
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        const fileRegex = /href="([^"]+\.(jpg|jpeg|png|gif|webp|bmp|svg))"/gi;
        let match;
        
        while ((match = fileRegex.exec(html)) !== null) {
            const fileName = match[1];
            // Skip any files that are not actual image files (like setup files)
            if (!fileName.includes('_setup') && !fileName.includes('terms')) {
                return fileName;
            }
        }
        
        return null;
    }

    async scanKnownActivities() {
        // Try to dynamically discover activities by attempting to access common folder names
        const activities = [];
        
        // Try to fetch a directory listing or use a different approach
        // For now, we'll try to access the Activities folder and see what we can discover
        try {
            const response = await fetch('Activities/');
            if (response.ok) {
                const html = await response.text();
                const activities = await this.parseDirectoryListing(html);
                return activities;
            }
        } catch (error) {
            console.log('Could not fetch directory listing:', error);
        }
        
        // If directory listing fails, return empty array
        // The user will need to add activities manually or implement server-side discovery
        console.warn('No activities discovered. Please ensure activities are properly configured.');
        return [];
    }

    async findImageFile(folderName) {
        // Try to fetch a directory listing of the activity folder to find any image file
        try {
            const response = await fetch(`Activities/${folderName}/`);
            if (response.ok) {
                const html = await response.text();
                const imageFile = this.parseImageFromDirectory(html);
                if (imageFile) {
                    return imageFile;
                }
            }
        } catch (error) {
            console.log(`Could not fetch directory listing for ${folderName}:`, error);
        }
        
        return null;
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
        try {
            const termsPath = `Activities/${activityName}/terms.txt`;
            console.log(`Attempting to load terms from: ${termsPath}`);
            
            // Don't double-encode - the activityName should already be properly formatted
            const response = await fetch(termsPath);
            
            if (!response.ok) {
                console.warn(`Could not load terms from ${termsPath} (${response.status}: ${response.statusText}), using fallback`);
                return this.getFallbackTerms(activityName);
            }
            
            const termsText = await response.text();
            const terms = termsText
                .split('\n')
                .map(term => term.trim())
                .filter(term => term.length > 0);
            
            console.log(`Loaded ${terms.length} terms from ${termsPath}:`, terms);
            return terms;
        } catch (error) {
            console.error(`Error loading terms for ${activityName}:`, error);
            return this.getFallbackTerms(activityName);
        }
    }

    async loadSetupFromFile(activityName) {
        try {
            const setupPath = `Activities/${activityName}/${activityName}_setup.json`;
            console.log(`Attempting to load setup from: ${setupPath}`);
            
            // Don't double-encode - the activityName should already be properly formatted
            const response = await fetch(setupPath);
            
            if (!response.ok) {
                console.log(`No setup file found at ${setupPath} (${response.status}: ${response.statusText}), using empty setup`);
                return { dropZones: [] };
            }
            
            const setupData = await response.json();
            console.log(`Loaded setup data from ${setupPath}:`, setupData);
            return setupData;
        } catch (error) {
            console.error(`Error loading setup for ${activityName}:`, error);
            return { dropZones: [] };
        }
    }

    getFallbackTerms(activityName) {
        // No hardcoded fallback terms - let the dynamic loading handle it
        console.warn(`No fallback terms available for ${activityName}`);
        return [];
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