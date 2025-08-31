// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading screen
    setTimeout(function() {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 2000);
    
    // Update title counts
    updateTitleCounts();
    
    // Update last backup time
    updateLastBackupTime();
    
    // Auto-save every 2 minutes
    setInterval(autoSave, 120000);
});

// Function to update last backup time
function updateLastBackupTime() {
    const lastBackup = localStorage.getItem('lastBackupTime');
    if (lastBackup) {
        const date = new Date(lastBackup);
        document.getElementById('lastBackup').textContent = date.toLocaleString();
    }
}

// Auto-save function
function autoSave() {
    // Just save to localStorage (auto-save while working)
    saveAllData();
    console.log('Auto-saved data to localStorage');
}

// Save all data to localStorage
function saveAllData() {
    // This function is called automatically when you make changes
    const animeList = JSON.parse(localStorage.getItem('animeList')) || [];
    const mangaList = JSON.parse(localStorage.getItem('mangaList')) || [];
    const manhwaList = JSON.parse(localStorage.getItem('manhwaList')) || [];
    
    // Update last backup time
    localStorage.setItem('lastBackupTime', new Date().toISOString());
    updateLastBackupTime();
}

// Export data function
function exportData() {
    const data = {
        animeList: JSON.parse(localStorage.getItem('animeList')) || [],
        mangaList: JSON.parse(localStorage.getItem('mangaList')) || [],
        manhwaList: JSON.parse(localStorage.getItem('manhwaList')) || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `anime-memories-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Update last backup time
    localStorage.setItem('lastBackupTime', new Date().toISOString());
    updateLastBackupTime();
    
    alert('✅ Data exported successfully!\n\nPlease save this file to your Google Drive:\n1. Go to drive.google.com\n2. Click "New" > "File upload"\n3. Select the downloaded file');
}

// Import data function
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (confirm('⚠️ Importing data will overwrite your current lists. Continue?')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate the data structure
                if (data.animeList && Array.isArray(data.animeList)) {
                    localStorage.setItem('animeList', JSON.stringify(data.animeList));
                }
                if (data.mangaList && Array.isArray(data.mangaList)) {
                    localStorage.setItem('mangaList', JSON.stringify(data.mangaList));
                }
                if (data.manhwaList && Array.isArray(data.manhwaList)) {
                    localStorage.setItem('manhwaList', JSON.stringify(data.manhwaList));
                }
                
                // Update last backup time
                localStorage.setItem('lastBackupTime', new Date().toISOString());
                updateLastBackupTime();
                updateTitleCounts();
                
                alert('✅ Data imported successfully!');
                
                // Refresh the page if we're on a list page
                if (window.location.pathname.includes('anime.html') || 
                    window.location.pathname.includes('manga.html') || 
                    window.location.pathname.includes('manhwa.html')) {
                    window.location.reload();
                }
            } catch (error) {
                alert('❌ Error importing data: Invalid file format');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
    
    // Reset the file input
    event.target.value = '';
}

// Function to update title counts
function updateTitleCounts() {
    const animeList = JSON.parse(localStorage.getItem('animeList')) || [];
    const mangaList = JSON.parse(localStorage.getItem('mangaList')) || [];
    const manhwaList = JSON.parse(localStorage.getItem('manhwaList')) || [];
    
    document.getElementById('anime-count').textContent = animeList.length;
    document.getElementById('manga-count').textContent = mangaList.length;
    document.getElementById('manhwa-count').textContent = manhwaList.length;
}