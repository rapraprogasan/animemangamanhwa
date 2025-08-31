// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading screen
    setTimeout(function() {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 2000);
    
    // Initialize anime list from localStorage
    let animeList = JSON.parse(localStorage.getItem('animeList')) || [];
    
    // DOM Elements
    const addAnimeBtn = document.getElementById('add-anime-btn');
    const addModal = document.getElementById('add-modal');
    const editModal = document.getElementById('edit-modal');
    const videoModal = document.getElementById('video-modal');
    const closeModalButtons = document.querySelectorAll('.close');
    const animeForm = document.getElementById('anime-form');
    const editForm = document.getElementById('edit-form');
    const animeListContainer = document.getElementById('anime-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('global-search');
    
    // Show add modal
    addAnimeBtn.addEventListener('click', function() {
        addModal.style.display = 'flex';
    });
    
    // Close modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            addModal.style.display = 'none';
            editModal.style.display = 'none';
            videoModal.style.display = 'none';
            document.getElementById('video-container').innerHTML = '';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
        if (event.target === videoModal) {
            videoModal.style.display = 'none';
            document.getElementById('video-container').innerHTML = '';
        }
    });
    
    // Add new anime
    animeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newAnime = {
            id: Date.now(),
            title: document.getElementById('title').value,
            image: document.getElementById('image').value || 'https://via.placeholder.com/300x200?text=No+Image',
            status: document.getElementById('status').value,
            rating: document.getElementById('rating').value,
            episodes: document.getElementById('episodes').value,
            notes: document.getElementById('notes').value,
            link: document.getElementById('link').value,
            video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Example video
        };
        
        animeList.push(newAnime);
        saveAnimeList();
        
        // Update the counts on the main page
        if (window.opener) {
            window.opener.updateTitleCounts();
        }
        
        renderAnimeList();
        animeForm.reset();
        addModal.style.display = 'none';
        
        alert('Anime added successfully!');
    });
    
    // Edit anime form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('edit-id').value);
        const title = document.getElementById('edit-title').value;
        const image = document.getElementById('edit-image').value;
        const status = document.getElementById('edit-status').value;
        const rating = document.getElementById('edit-rating').value;
        const episodes = document.getElementById('edit-episodes').value;
        const notes = document.getElementById('edit-notes').value;
        const link = document.getElementById('edit-link').value;
        
        // Find and update the anime
        const animeIndex = animeList.findIndex(anime => anime.id === id);
        if (animeIndex !== -1) {
            animeList[animeIndex] = {
                ...animeList[animeIndex],
                title,
                image: image || 'https://via.placeholder.com/300x200?text=No+Image',
                status,
                rating,
                episodes,
                notes,
                link
            };
            
            saveAnimeList();
            renderAnimeList();
            editModal.style.display = 'none';
            
            alert('Anime updated successfully!');
        }
    });
    
    // Filter anime
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            renderAnimeList(filter);
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredAnime = animeList.filter(anime => 
            anime.title.toLowerCase().includes(searchTerm)
        );
        renderFilteredAnimeList(filteredAnime);
    });
    
    // Save anime list to localStorage
    function saveAnimeList() {
        localStorage.setItem('animeList', JSON.stringify(animeList));
        saveDataToDrive(); // Save to Google Drive
    }
    
    // Render anime list
    function renderAnimeList(filter = 'all') {
        let filteredAnime = animeList;
        
        if (filter !== 'all') {
            filteredAnime = animeList.filter(anime => anime.status === filter);
        }
        
        renderFilteredAnimeList(filteredAnime);
    }
    
    // Render filtered anime list
    function renderFilteredAnimeList(list) {
        animeListContainer.innerHTML = '';
        
        if (list.length === 0) {
            animeListContainer.innerHTML = '<p class="no-items">No anime found. Add some to your list!</p>';
            return;
        }
        
        list.forEach(anime => {
            const animeCard = document.createElement('div');
            animeCard.className = 'item-card';
            animeCard.innerHTML = `
                <div class="item-image">
                    <img src="${anime.image}" alt="${anime.title}">
                    <div class="play-overlay">
                        <div class="play-btn" data-video="${anime.video}">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="item-details">
                    <h3 class="item-title">${anime.title}</h3>
                    <span class="item-status ${getStatusClass(anime.status)}">${formatStatus(anime.status)}</span>
                    ${anime.rating ? `<div class="item-rating"><i class="fas fa-star"></i> ${anime.rating}/10</div>` : ''}
                    ${anime.episodes ? `<div class="item-progress">Episodes: ${anime.episodes}</div>` : ''}
                    <p class="item-notes">${anime.notes || 'No notes added.'}</p>
                    <div class="item-actions">
                        ${anime.link ? `<a href="${anime.link}" target="_blank" class="action-btn link-btn"><i class="fas fa-external-link-alt"></i> Visit</a>` : ''}
                        <button class="action-btn edit-btn" data-id="${anime.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn delete-btn" data-id="${anime.id}"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;
            
            animeListContainer.appendChild(animeCard);
        });
        
        // Add event listeners for play buttons
        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', function() {
                const videoUrl = this.getAttribute('data-video');
                document.getElementById('video-container').innerHTML = `
                    <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
                `;
                videoModal.style.display = 'flex';
            });
        });
        
        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this anime?')) {
                    animeList = animeList.filter(anime => anime.id !== id);
                    saveAnimeList();
                    
                    // Update the counts on the main page
                    if (window.opener) {
                        window.opener.updateTitleCounts();
                    }
                    
                    renderAnimeList();
                }
            });
        });
        
        // Add event listeners for edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const anime = animeList.find(a => a.id === id);
                
                if (anime) {
                    // Populate the edit form with anime data
                    document.getElementById('edit-id').value = anime.id;
                    document.getElementById('edit-title').value = anime.title;
                    document.getElementById('edit-image').value = anime.image;
                    document.getElementById('edit-status').value = anime.status;
                    document.getElementById('edit-rating').value = anime.rating || '';
                    document.getElementById('edit-episodes').value = anime.episodes || '';
                    document.getElementById('edit-notes').value = anime.notes || '';
                    document.getElementById('edit-link').value = anime.link || '';
                    
                    // Show the edit modal
                    editModal.style.display = 'flex';
                }
            });
        });
    }
    
    // Format status for display
    function formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // Helper function to get the correct status class
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
    
    // Save data to Google Drive (simplified version)
    function saveDataToDrive() {
        // This is a simplified version - in a real app you'd use the Google Drive API
        const data = {
            animeList: JSON.parse(localStorage.getItem('animeList')) || [],
            mangaList: JSON.parse(localStorage.getItem('mangaList')) || [],
            manhwaList: JSON.parse(localStorage.getItem('manhwaList')) || [],
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('googleDriveData', JSON.stringify(data));
        console.log('Data saved to Google Drive backup');
    }
    
    // Initial render
    renderAnimeList();
});