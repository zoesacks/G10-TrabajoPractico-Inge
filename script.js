let map;
let markers = [];
let centrosData = [];
let selectedCentroId = null;
let filtrosActivos = {
    'Centro Fijo': true,
    'Centro Movil': true
};

// Definir iconos personalizados
const iconoFijo = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconoMovil = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconoSeleccionado = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [32, 52],
    iconAnchor: [16, 52],
    popupAnchor: [1, -44],
    shadowSize: [52, 52]
});

// Inicializar el mapa
function initMap() {
    map = L.map('map').setView([-34.752, -58.380], 13);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

// Cargar datos del JSON
async function cargarCentros() {
    try {
        const response = await fetch('centros.json');
        const data = await response.json();
        
        centrosData = data.centros;
        console.log('Centros cargados:', centrosData);
        
        // Crear marcadores y cards para cada centro
        centrosData.forEach(centro => {
            agregarMarcador(centro);
            crearCard(centro);
        });

        actualizarContador();
        
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
        document.getElementById('cardsContainer').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>Error:</strong> No se pudo cargar el archivo centros.json. 
                Verifica que existe en la misma carpeta.
            </div>
        `;
    }
}

// Función para crear una card
function crearCard(centro) {
    const cardsContainer = document.getElementById('cardsContainer');
    
    const cardColor = centro.categoria === 'Centro Fijo' ? 'border-info' : 'border-danger';
    const badgeColor = centro.categoria === 'Centro Fijo' ? 'bg-info' : 'bg-danger';
    const icono = centro.categoria === 'Centro Fijo' ? '🏥' : '🚑';
    
    const cardHTML = `
        <div class="card mb-3 card-centro ${cardColor}" id="card-${centro.id}" data-id="${centro.id}" data-categoria="${centro.categoria}" onclick="seleccionarCentro(${centro.id})">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="card-title mb-2">${icono} ${centro.nombre}</h5>
                    <span class="badge ${badgeColor}">${centro.categoria}</span>
                </div>
                <p class="card-text text-muted mb-2">${centro.descripcion}</p>
                <p class="card-text small mb-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    ${centro.direccion}
                </p>
            </div>
        </div>
    `;
    
    cardsContainer.innerHTML += cardHTML;
}

// Función para agregar marcadores
function agregarMarcador(centro) {
    const lat = centro.coordenadas.lat;
    const lng = centro.coordenadas.lng;
    
    const icono = centro.categoria === 'Centro Fijo' ? iconoFijo : iconoMovil;
    
    let marker = L.marker([lat, lng], { icon: icono });
    
    const badgeColor = centro.categoria === 'Centro Fijo' ? 'bg-info' : 'bg-danger';
    
    const popupContent = `
        <div class="popup-content">
            <h6><strong>${centro.nombre}</strong></h6>
            <p class="mb-1">${centro.descripcion}</p>
            <p class="mb-1 text-muted small">📍 ${centro.direccion}</p>
            <span class="badge ${badgeColor}">${centro.categoria}</span>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Guardar datos adicionales en el marcador
    marker.centroData = centro;
    marker.categoria = centro.categoria;
    marker.centroId = centro.id;
    marker.iconoOriginal = icono;
    
    // Click en el marcador
    marker.on('click', function() {
        seleccionarCentro(centro.id);
    });
    
    marker.addTo(map);
    markers.push(marker);
}

// Función para seleccionar un centro
function seleccionarCentro(centroId) {
    // Deseleccionar el anterior
    if (selectedCentroId !== null) {
        const cardAnterior = document.getElementById(`card-${selectedCentroId}`);
        if (cardAnterior) {
            cardAnterior.classList.remove('card-selected');
        }
        
        // Restaurar icono del marcador anterior
        const markerAnterior = markers.find(m => m.centroId === selectedCentroId);
        if (markerAnterior) {
            markerAnterior.setIcon(markerAnterior.iconoOriginal);
        }
    }
    
    // Seleccionar el nuevo
    selectedCentroId = centroId;
    const card = document.getElementById(`card-${centroId}`);
    if (card) {
        card.classList.add('card-selected');
        // Scroll hacia la card
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Cambiar icono del marcador seleccionado
    const marker = markers.find(m => m.centroId === centroId);
    if (marker) {
        marker.setIcon(iconoSeleccionado);
        map.setView(marker.getLatLng(), 15, { animate: true });
        marker.openPopup();
    }
}

// Función para alternar filtros
function toggleFilter(categoria) {
    filtrosActivos[categoria] = document.getElementById(`check-${categoria === 'Centro Fijo' ? 'fijo' : 'movil'}`).checked;
    filtrarCentros();
}

// Función para filtrar centros
function filtrarCentros() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let visibles = 0;

    // Filtrar marcadores
    markers.forEach(marker => {
        const coincideCategoria = filtrosActivos[marker.categoria];
        const centro = marker.centroData;
        const coincideBusqueda = searchTerm === '' || 
                                centro.nombre.toLowerCase().includes(searchTerm) || 
                                centro.descripcion.toLowerCase().includes(searchTerm) ||
                                centro.direccion.toLowerCase().includes(searchTerm);
        
        if (coincideCategoria && coincideBusqueda) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });

    // Filtrar cards
    document.querySelectorAll('.card-centro').forEach(card => {
        const centroId = parseInt(card.dataset.id);
        const categoria = card.dataset.categoria;
        const centro = centrosData.find(c => c.id === centroId);
        
        const coincideCategoria = filtrosActivos[categoria];
        const coincideBusqueda = searchTerm === '' || 
                                centro.nombre.toLowerCase().includes(searchTerm) || 
                                centro.descripcion.toLowerCase().includes(searchTerm) ||
                                centro.direccion.toLowerCase().includes(searchTerm);
        
        if (coincideCategoria && coincideBusqueda) {
            card.style.display = 'block';
            visibles++;
        } else {
            card.style.display = 'none';
        }
    });

    actualizarContador(visibles);
}

// Actualizar contador
function actualizarContador(cantidad = null) {
    if (cantidad === null) {
        cantidad = document.querySelectorAll('.card-centro').length;
    }
    document.getElementById('cantidadMarcadores').textContent = cantidad;
}

// Inicializar todo cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    cargarCentros();
    
    // Búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('input', function() {
        filtrarCentros();
    });
});