import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function HomeSectionsDocs({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">📚 Docs — Home Sections Builder</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* Reglas generales */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 mb-2">⚠️ Reglas generales</h3>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
              <li><strong>Solo 1 Hero Carousel</strong> está permitido por página.</li>
              <li><strong>No se permiten nietos</strong> (niveles de anidación máxima: 1).</li>
              <li>Los campos <code className="bg-amber-100 px-1 rounded">href</code> aceptan rutas relativas <code className="bg-amber-100 px-1 rounded">/product/mi-producto</code> o absolutas <code className="bg-amber-100 px-1 rounded">https://...</code></li>
              <li>Los campos de imagen aceptan URLs externas o rutas relativas a <code className="bg-amber-100 px-1 rounded">/assets/images/...</code></li>
              <li>El campo <code className="bg-amber-100 px-1 rounded">enabled</code> activa/desactiva la sección sin eliminarla.</li>
            </ul>
          </section>

          {/* Hero Carousel */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">type: hero_carousel</span>
              <span className="text-xs text-gray-500">— Solo 1 por página</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Slider horizontal para hero. Cada <strong>slide</strong> tiene: imagen, enlace y alt. Se muestran en carrusel con flechas.
            </p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 whitespace-pre">{`{
  "type": "hero_carousel",
  "title": "Bienvenido a Vendora",
  "enabled": true,
  "payload": {
    "slides": [
      {
        "image": "https://images.unsplash.com/photo-xxxx?w=1600&q=80",
        "href": "/",
        "alt": "Banner principal"
      },
      {
        "image": "/assets/images/slider-2.jpg",
        "href": "/browse",
        "alt": "Productos en oferta"
      }
    ]
  }
}`}</pre>
            </div>
          </section>

          {/* Card Grid */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">type: card_grid</span>
              <span className="text-xs text-gray-500">— N cards, hasta 4 hijos por card</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Cuadrícula de cards. En el textarea de <strong>Payload JSON</strong> solo escribes el objeto <code className="bg-blue-100 px-1 rounded">payload</code> (sin wrapper de sección). Cada card puede tener hasta <strong>4 items</strong> (solo variant=quad).
            </p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 whitespace-pre">{`{
  "columns": 4,
  "cards": [
    {
      "variant": "fat",
      "title": "Smartphones",
      "image": "https://images.unsplash.com/photo-xxxx?w=600&q=80",
      "href": "/browse?category=smartphones",
      "cta": "Ver más"
    },
    {
      "variant": "quad",
      "title": "Laptops",
      "items": [
        { "title": "Gaming", "image": "...", "href": "/laptops/gaming", "cta": "" },
        { "title": "Oficina", "image": "...", "href": "/laptops/office", "cta": "" },
        { "title": "Estudiantes", "image": "...", "href": "/laptops/students", "cta": "" },
        { "title": "Ultrabooks", "image": "...", "href": "/laptops/ultrabooks", "cta": "" }
      ]
    }
  ]
}`}</pre>
            </div>
          </section>

          {/* Sellers Carousel */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">type: sellers_carousel</span>
              <span className="text-xs text-gray-500">— Carrusel de productos o categorías</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Carrusel horizontal de vendedores o productos. Cada <strong>ítem</strong> puede tener hasta <strong>4 sub-ítems</strong>. El modo <code className="bg-gray-100 px-1 rounded">manual</code> muestra los ítems definidos manualmente.
            </p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 whitespace-pre">{`{
  "type": "sellers_carousel",
  "title": "Los más vendidos",
  "enabled": true,
  "payload": {
    "mode": "manual",
    "categoryId": "",
    "categorySlug": "",
    "limit": 16,
    "items": [
      {
        "image": "https://images.unsplash.com/photo-xxxx?w=400&q=80",
        "href": "/vendor/mi-tienda",
        "label": "Tienda TechStore"
      },
      {
        "image": "https://images.unsplash.com/photo-yyyy?w=400&q=80",
        "href": "/vendor/otro-vendedor",
        "label": "ElectroExpress"
      }
    ]
  }
}`}</pre>
            </div>
          </section>

          {/* Ejemplo completo de sección */}
          <section>
            <h3 className="font-bold text-gray-900 mb-3">📦 Ejemplo completo — payload guardado en DB</h3>
            <p className="text-xs text-gray-500 mb-2">
              Así se almacena la sección en <code className="bg-gray-100 px-1 rounded">vendora_home_sections</code> (campo <code className="bg-gray-100 px-1 rounded">data</code>):
            </p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 whitespace-pre">{`{
  "id": "abc123def456",
  "title": "Ofertas de la semana",
  "type": "card_grid",
  "enabled": true,
  "position": 0,
  "payload": {
    "columns": 4,
    "cards": [
      {
        "variant": "fat",
        "title": "iPhone 15",
        "image": "https://images.unsplash.com/photo-xxx",
        "href": "/product/apple-iphone-15",
        "cta": "Comprar"
      },
      {
        "variant": "quad",
        "title": "Samsung Galaxy",
        "items": [
          { "title": "S24 Ultra", "image": "...", "href": "/product/galaxy-s24", "cta": "" },
          { "title": "S24+", "image": "...", "href": "/product/galaxy-s24-plus", "cta": "" },
          { "title": "Z Fold 5", "image": "...", "href": "/product/zfold5", "cta": "" },
          { "title": "A54 5G", "image": "...", "href": "/product/galaxy-a54", "cta": "" }
        ]
      }
    ]
  }
}`}</pre>
            </div>
          </section>

          {/* Posiciones */}
          <section className="bg-gray-50 border rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">📍 Posiciones de sección</h3>
            <p className="text-sm text-gray-600">
              La posición se controla con <strong>↑ Subir</strong> y <strong>↓ Bajar</strong>. La posición 0 es la primera que se renderiza. El hero carousel siempre se fuerza a posición 0.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
