import React, { useState } from 'react'

export default function SamriddhiDetailsPage({ property }) {
  const p = property || {}
  const [selected, setSelected] = useState(p.images?.[0] || '')
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  function submitEnquiry(e) {
    e.preventDefault()
    // placeholder: integrate with backend / analytics
    alert(`Enquiry sent for ${p.title || 'property'} — we'll contact you soon.`)
    setForm({ name: '', phone: '', message: '' })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-serif">{p.title}</h1>
        <p className="text-gray-600 mt-1">{p.subtitle || p.location}</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden shadow-lg">
            {selected ? (
              <img src={selected} alt="hero" className="w-full h-96 object-cover" />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">No image</div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {(p.images || []).map((src, i) => (
              <button
                key={i}
                onClick={() => setSelected(src)}
                className={`border rounded overflow-hidden ${selected === src ? 'ring-2 ring-amber-400' : ''}`}
              >
                <img src={src} alt={`thumb-${i}`} className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>

          <article className="mt-6 prose">
            <h2>Overview</h2>
            <p>{p.details}</p>

            {p.detailsSections?.map((sec, idx) => (
              <div key={idx} className="mt-4">
                <h3 className="font-semibold">{sec.heading}</h3>
                <p>{sec.text}</p>
              </div>
            ))}
          </article>
        </div>

        <aside className="space-y-4">
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm text-gray-500">Starting Price</div>
                <div className="text-xl font-semibold">{p.price || p.startingPrice}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{p.status || p.type}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <a className="block text-center bg-amber-500 text-white py-2 rounded" href={`https://wa.me/91${(p.contacts?.sales||'').replace(/\D/g,'')}`} target="_blank" rel="noreferrer">WhatsApp Now</a>
              <a className="block text-center border py-2 rounded" href="#map">View Map</a>
              <a className="block text-center border py-2 rounded" href="#contact">Contact Agent</a>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-white">
            <h4 className="font-semibold mb-2">Quick Enquiry</h4>
            <form onSubmit={submitEnquiry} id="contact">
              <input className="w-full mb-2 p-2 border rounded" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              <input className="w-full mb-2 p-2 border rounded" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
              <textarea className="w-full mb-2 p-2 border rounded" placeholder="Message" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
              <button type="submit" className="w-full bg-amber-500 text-white py-2 rounded">Submit Enquiry</button>
            </form>
          </div>

          <div className="p-4 border rounded-lg bg-white">
            <h4 className="font-semibold">Amenities</h4>
            <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
              {(p.amenities || []).map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  )
}
