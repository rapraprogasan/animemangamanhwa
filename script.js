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
    
    // Add scroll effect to header
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        
        // Trigger scroll once on page load to set initial state
        window.dispatchEvent(new Event('scroll'));
    }
    
    // Initialize search functionality
    initializeSearch();
});

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('global-search');
    const searchButton = document.querySelector('.search-bar button');
    
    if (searchInput && searchButton) {
        // Search on button click
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
        
        // Search on Enter key press
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
        
        // Real-time search as you type
        searchInput.addEventListener('input', function() {
            performSearch(searchInput.value);
        });
    }
}

// Perform search function
function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
        // If search is empty, show all items
        clearSearchHighlights();
        updateTitleCounts(); // Reset to show all counts
        return;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Check which page we're on and perform appropriate search
    if (window.location.pathname.includes('anime.html')) {
        searchAnime(searchLower);
    } else if (window.location.pathname.includes('manga.html')) {
        searchManga(searchLower);
    } else if (window.location.pathname.includes('manhwa.html')) {
        searchManhwa(searchLower);
    } else {
        // On home page, search across all categories
        searchAllCategories(searchLower);
    }
}

// Search anime function
function searchAnime(searchTerm) {
    const animeList = JSON.parse(localStorage.getItem('animeList')) || [];
    const filteredAnime = animeList.filter(anime => 
        anime.title.toLowerCase().includes(searchTerm) ||
        (anime.notes && anime.notes.toLowerCase().includes(searchTerm)) ||
        (anime.status && anime.status.toLowerCase().includes(searchTerm))
    );
    
    // Call the render function from anime.js if it exists
    if (typeof window.renderFilteredAnimeList === 'function') {
        window.renderFilteredAnimeList(filteredAnime);
    } else {
        // Fallback: reload the page with search parameter
        window.location.href = `anime.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Search manga function
function searchManga(searchTerm) {
    const mangaList = JSON.parse(localStorage.getItem('mangaList')) || [];
    const filteredManga = mangaList.filter(manga => 
        manga.title.toLowerCase().includes(searchTerm) ||
        (manga.notes && manga.notes.toLowerCase().includes(searchTerm)) ||
        (manga.status && manga.status.toLowerCase().includes(searchTerm))
    );
    
    if (typeof window.renderFilteredMangaList === 'function') {
        window.renderFilteredMangaList(filteredManga);
    } else {
        window.location.href = `manga.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Search manhwa function
function searchManhwa(searchTerm) {
    const manhwaList = JSON.parse(localStorage.getItem('manhwaList')) || [];
    const filteredManhwa = manhwaList.filter(manhwa => 
        manhwa.title.toLowerCase().includes(searchTerm) ||
        (manhwa.notes && manhwa.notes.toLowerCase().includes(searchTerm)) ||
        (manhwa.status && manhwa.status.toLowerCase().includes(searchTerm))
    );
    
    if (typeof window.renderFilteredManhwaList === 'function') {
        window.renderFilteredManhwaList(filteredManhwa);
    } else {
        window.location.href = `manhwa.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Search all categories (for home page) - FIXED VERSION
function searchAllCategories(searchTerm) {
    const animeList = JSON.parse(localStorage.getItem('animeList')) || [];
    const mangaList = JSON.parse(localStorage.getItem('mangaList')) || [];
    const manhwaList = JSON.parse(localStorage.getItem('manhwaList')) || [];
    
    // Search through ALL titles in ALL categories
    const animeResults = searchTitlesInCategory(animeList, searchTerm, 'Anime');
    const mangaResults = searchTitlesInCategory(mangaList, searchTerm, 'Manga');
    const manhwaResults = searchTitlesInCategory(manhwaList, searchTerm, 'Manhwa');
    
    // Display search results
    displaySearchResults(animeResults, mangaResults, manhwaResults, searchTerm);
}

// Helper function to search titles in a specific category
function searchTitlesInCategory(itemList, searchTerm, categoryType) {
    return itemList.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm))
    ).map(item => ({
        ...item,
        category: categoryType
    }));
}

// Display search results on home page
function displaySearchResults(animeResults, mangaResults, manhwaResults, searchTerm) {
    const statsSection = document.querySelector('.stats');
    const searchResultsContainer = document.getElementById('search-results-container') || createSearchResultsContainer();
    
    // Clear previous results
    searchResultsContainer.innerHTML = '';
    
    // Hide original stats section
    if (statsSection) {
        statsSection.style.display = 'none';
    }
    
    // Create search results header
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'search-results-header';
    resultsHeader.innerHTML = `
        <h2>Search Results for "${searchTerm}"</h2>
        <p>Found ${animeResults.length + mangaResults.length + manhwaResults.length} results</p>
        <button onclick="clearSearch()" class="btn btn-clear-search">
            <i class="fas fa-times"></i> Clear Search
        </button>
    `;
    searchResultsContainer.appendChild(resultsHeader);
    
    // Display results by category
    if (animeResults.length > 0) {
        displayCategoryResults(animeResults, 'Anime', searchResultsContainer);
    }
    
    if (mangaResults.length > 0) {
        displayCategoryResults(mangaResults, 'Manga', searchResultsContainer);
    }
    
    if (manhwaResults.length > 0) {
        displayCategoryResults(manhwaResults, 'Manhwa', searchResultsContainer);
    }
    
    // Show message if no results found
    if (animeResults.length === 0 && mangaResults.length === 0 && manhwaResults.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <i class="fas fa-search fa-3x"></i>
            <h3>No results found for "${searchTerm}"</h3>
            <p>Try different keywords or check the spelling</p>
        `;
        searchResultsContainer.appendChild(noResults);
    }
}

// Display results for a specific category
function displayCategoryResults(results, categoryName, container) {
    const categorySection = document.createElement('div');
    categorySection.className = 'search-category-section';
    categorySection.innerHTML = `
        <h3><i class="fas fa-${getCategoryIcon(categoryName)}"></i> ${categoryName} (${results.length})</h3>
    `;
    
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'search-results-grid';
    
    results.forEach(item => {
        const resultCard = document.createElement('div');
        resultCard.className = 'search-result-card';
        resultCard.innerHTML = `
            <div class="search-result-image">
                <img src="${item.image || 'https://via.placeholder.com/100x150?text=No+Image'}" alt="${item.title}">
            </div>
            <div class="search-result-details">
                <h4>${item.title}</h4>
                <span class="item-status ${getStatusClass(item.status)}">${formatStatus(item.status)}</span>
                ${item.rating ? `<div class="item-rating"><i class="fas fa-star"></i> ${item.rating}/10</div>` : ''}
                ${item.notes ? `<p class="search-result-notes">${item.notes}</p>` : ''}
                <div class="search-result-actions">
                    <button onclick="viewItem('${item.category}', ${item.id})" class="btn btn-view">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        resultsGrid.appendChild(resultCard);
    });
    
    categorySection.appendChild(resultsGrid);
    container.appendChild(categorySection);
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'Anime': 'film',
        'Manga': 'book',
        'Manhwa': 'globe-asia'
    };
    return icons[category] || 'search';
}

// View item function
function viewItem(category, itemId) {
    // Redirect to the appropriate category page
    window.location.href = `${category.toLowerCase()}.html`;
    
    // You might want to implement a way to highlight the specific item
    // This could be done with URL parameters or localStorage
    localStorage.setItem('highlightItem', JSON.stringify({
        category: category,
        id: itemId
    }));
}

// Clear search function
function clearSearch() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    const statsSection = document.querySelector('.stats');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    if (statsSection) {
        statsSection.style.display = 'block';
    }
    
    if (searchResultsContainer) {
        searchResultsContainer.style.display = 'none';
    }
    
    // Reset counts
    updateTitleCounts();
}

// Create search results container
function createSearchResultsContainer() {
    const container = document.createElement('div');
    container.id = 'search-results-container';
    container.className = 'search-results-container';
    
    const main = document.querySelector('main');
    const statsSection = document.querySelector('.stats');
    
    if (main && statsSection) {
        main.insertBefore(container, statsSection.nextSibling);
    }
    
    return container;
}

// Clear search highlights
function clearSearchHighlights() {
    const statsSection = document.querySelector('.stats');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    if (statsSection) {
        statsSection.style.display = 'block';
    }
    
    if (searchResultsContainer) {
        searchResultsContainer.style.display = 'none';
    }
}

// Helper function to format status
function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Helper function to get status class
function getStatusClass(status) {
    const statusMap = {
        'currently-watching': 'status-currently-watching',
        'currently-reading': 'status-currently-reading',
        'completed': 'status-completed',
        'dropped': 'status-dropped',
        'plan-to-watch': 'status-plan-to-watch',
        'plan-to-read': 'status-plan-to-read'
    };
    return statusMap[status] || 'status-completed';
}

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
    saveAllData();
    console.log('Auto-saved data to localStorage');
}

// Save all data to localStorage
function saveAllData() {
    const animeList = JSON.parse(localStorage.getItem('animeList')) || [];
    const mangaList = JSON.parse(localStorage.getItem('mangaList')) || [];
    const manhwaList = JSON.parse(localStorage.getItem('manhwaList')) || [];
    
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
                
                if (data.animeList && Array.isArray(data.animeList)) {
                    localStorage.setItem('animeList', JSON.stringify(data.animeList));
                }
                if (data.mangaList && Array.isArray(data.mangaList)) {
                    localStorage.setItem('mangaList', JSON.stringify(data.mangaList));
                }
                if (data.manhwaList && Array.isArray(data.manhwaList)) {
                    localStorage.setItem('manhwaList', JSON.stringify(data.manhwaList));
                }
                
                localStorage.setItem('lastBackupTime', new Date().toISOString());
                updateLastBackupTime();
                updateTitleCounts();
                
                alert('✅ Data imported successfully!');
                
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

// Add CSS for search results
const searchStyles = `
    .search-results-container {
        margin: 20px 0;
        padding: 20px;
        background: var(--glass);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .search-results-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .search-results-header h2 {
        color: var(--primary);
        margin-bottom: 10px;
    }
    
    .btn-clear-search {
        background: var(--dropped);
        margin-top: 15px;
    }
    
    .search-category-section {
        margin-bottom: 30px;
    }
    
    .search-category-section h3 {
        color: white;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--primary);
    }
    
    .search-results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .search-result-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 15px;
        display: flex;
        gap: 15px;
        align-items: center;
        transition: transform 0.3s ease;
    }
    
    .search-result-card:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.1);
    }
    
    .search-result-image {
        width: 80px;
        height: 100px;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .search-result-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .search-result-details {
        flex: 1;
    }
    
    .search-result-details h4 {
        color: white;
        margin-bottom: 8px;
        font-size: 1.1rem;
    }
    
    .search-result-notes {
        color: rgba(255, 255, 255, 1);
        font-size: 0.9rem;
        margin: 8px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .search-result-actions {
        margin-top: 10px;
    }
    
    .btn-view {
        background: var(--primary);
        padding: 8px 15px;
        font-size: 0.9rem;
    }
    
    .no-results {
        text-align: center;
        padding: 40px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .no-results i {
        margin-bottom: 15px;
        color: var(--primary);
    }
`;

// Add search styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = searchStyles;
document.head.appendChild(styleElement);
    document.getElementById('anime-count').textContent = animeList.length;
    document.getElementById('manga-count').textContent = mangaList.length;
    document.getElementById('manhwa-count').textContent = manhwaList.length;

}
