let selectedCategory = 'Todos';
let map;
let markers = [];
let centrosData = [];

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
        
        // Crear marcadores para cada centro
        centrosData.forEach(centro => {
            agregarMarcador(centro);
        });

        actualizarContador();
        
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
        alert('Error al cargar los centros. Verifica que el archivo centros.json existe en la misma carpeta.');
    }
}

// Función para agregar marcadores desde los datos del JSON
function agregarMarcador(centro) {
    const lat = centro.coordenadas.lat;
    const lng = centro.coordenadas.lng;
    
    // Seleccionar icono según la categoría
    const icono = centro.categoria === 'Centro Fijo' ? iconoFijo : iconoMovil;
    
    // Crear el marcador con el icono correspondiente
    let marker = L.marker([lat, lng], { icon: icono });
    
    // Color del badge según la categoría
    const badgeColor = centro.categoria === 'Centro Fijo' ? 'bg-primary' : 'bg-danger';
    
    // Crear el contenido del popup
    const popupContent = `
        <div class="popup-content">
            <h6><strong>${centro.nombre}</strong></h6>
            <p class="mb-1">${centro.descripcion}</p>
            <p class="mb-1 text-muted small"><i class="bi bi-geo-alt"></i> ${centro.direccion}</p>
            <span class="badge ${badgeColor} badge-categoria">${centro.categoria}</span>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Guardar datos adicionales en el marcador
    marker.centroData = centro;
    marker.categoria = centro.categoria;
    marker.nombre = centro.nombre.toLowerCase();
    marker.descripcion = centro.descripcion.toLowerCase();
    marker.direccion = centro.direccion.toLowerCase();
    
    // Agregar al mapa
    marker.addTo(map);
    markers.push(marker);
}

// Función para cambiar categoría
function setCategory(category) {
    selectedCategory = category;
    filtrarMarcadores();
}

// Función para filtrar marcadores
function filtrarMarcadores() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let visibles = 0;

    markers.forEach(marker => {
        const coincideCategoria = selectedCategory === 'Todos' || marker.categoria === selectedCategory;
        const coincideBusqueda = searchTerm === '' || 
                                marker.nombre.includes(searchTerm) || 
                                marker.descripcion.includes(searchTerm) ||
                                marker.direccion.includes(searchTerm);
        
        if (coincideCategoria && coincideBusqueda) {
            marker.addTo(map);
            visibles++;
        } else {
            map.removeLayer(marker);
        }
    });

    // Actualizar el label con información de la categoría
    document.getElementById('categoryLabel').innerHTML = 
        `Categoría: ${selectedCategory} | <span id="cantidadMarcadores">${visibles}</span> ${visibles === 1 ? 'centro' : 'centros'} ${visibles === 1 ? 'encontrado' : 'encontrados'}`;
}

// Función de búsqueda
function buscarUbicacion() {
    filtrarMarcadores();
}

// Actualizar contador
function actualizarContador() {
    const visibles = markers.filter(m => map.hasLayer(m)).length;
    document.getElementById('cantidadMarcadores').textContent = visibles;
}

// Inicializar todo cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    cargarCentros();
    
    // Búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('input', function() {
        filtrarMarcadores();
    });

    // Búsqueda al presionar Enter
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarUbicacion();
        }
    });
});