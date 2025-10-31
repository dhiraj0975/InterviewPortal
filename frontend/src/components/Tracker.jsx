import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import { API_BASE } from '../routes/AppRoutes'

// ---------- UI helpers (Tailwind component classes) ----------
const tw = {
  card: 'bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-gray-100',
  input: 'w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none px-3 py-2.5 bg-white',
  select: 'w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none px-3 py-2.5 bg-white appearance-none',
  textarea: 'w-full rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none px-3 py-2.5 bg-white h-28 resize-none',
  btnPrimary: 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed',
  btnGhost: 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50',
  btnWarn: 'inline-flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200',
  btnDanger: 'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200',
  btnSoft: 'inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none',
  badgeBase: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
}

const emptyForm = {
  date: '',
  companyName: '',
  hrName: '',
  hrContact: '',
  role: '',
  location: '',
  rounds: '',
  interviewMode: '',
  offeredCTC: '',
  expectedCTC: '',
  discussion: '',
  nextStep: '',
  status: '',
  remarks: ''
}

const statusChip = (s='')=>{
  const map = {
    'Selected': 'bg-emerald-100 text-emerald-800',
    'Rejected': 'bg-rose-100 text-rose-800',
    'In Progress': 'bg-amber-100 text-amber-800',
    'Awaiting': 'bg-sky-100 text-sky-800',
  }
  return `${tw.badgeBase} ${map[s] || 'bg-gray-100 text-gray-800'}`
}

export default function InterviewTrackerUI(){
  // data
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // form/modal
  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [current, setCurrent] = useState(null)

  // ui state
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(()=>{ fetchList() }, [])

  const fetchList = async()=>{
    try{
      setLoading(true)
      const res = await axios.get(API_BASE)
      setList(res.data?.data || res.data || [])
    }catch(e){
      console.error(e)
      setError('Unable to fetch records')
    }finally{ setLoading(false) }
  }

  const openCreate = ()=>{
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (item)=>{
    setEditingId(item._id)
    setForm({
      date: item.date ? new Date(item.date).toISOString().slice(0,16) : '',
      companyName: item.companyName || '',
      hrName: item.hrName || '',
      hrContact: item.hrContact || '',
      role: item.role || '',
      location: item.location || '',
      rounds: item.rounds || '',
      interviewMode: item.interviewMode || '',
      offeredCTC: item.offeredCTC || '',
      expectedCTC: item.expectedCTC || '',
      discussion: item.discussion || '',
      nextStep: item.nextStep || '',
      status: item.status || '',
      remarks: item.remarks || ''
    })
    setFormOpen(true)
  }

  const openView = (item)=>{
    setCurrent(item)
    setViewOpen(true)
  }

  const onChange = (e)=>{
    const { name, value } = e.target
    setForm(p=>({...p, [name]: value}))
  }

  const resetForm = ()=>{
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  const onSubmit = async(e)=>{
    e.preventDefault()
    try{
      setLoading(true)
      if(editingId){
        await axios.put(`${API_BASE}/${editingId}`, form)
        Swal.fire('Updated!', 'Record has been updated successfully.', 'success')
      }else{
        await axios.post(API_BASE, form)
        Swal.fire('Created!', 'Record has been created successfully.', 'success')
      }
      await fetchList()
      setFormOpen(false)
      resetForm()
    }catch(err){
      console.error(err)
      Swal.fire('Error!', err?.response?.data?.message || 'Operation failed', 'error')
    }finally{
      setLoading(false)
    }
  }

  const onDelete = async(id)=>{
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })
    if (!result.isConfirmed) return
    try{
      setLoading(true)
      await axios.delete(`${API_BASE}/${id}`)
      await fetchList()
      Swal.fire('Deleted!', 'Record has been deleted.', 'success')
    }catch(e){
      console.error(e)
      Swal.fire('Error!', 'Delete failed', 'error')
    }finally{ setLoading(false) }
  }

  // filtering, search, pagination
  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    return list.filter(r=>{
      const okStatus = statusFilter==='All' ? true : (r.status===statusFilter)
      const okQuery = !q ? true : [
        r.companyName, r.hrName, r.hrContact, r.role, r.location, r.interviewMode, r.offeredCTC, r.expectedCTC, r.discussion, r.nextStep, r.remarks, r.status
      ].some(v=> String(v||'').toLowerCase().includes(q))
      return okStatus && okQuery
    })
  },[list, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageSafe = Math.min(page, totalPages)
  const start = (pageSafe-1)*pageSize
  const rows = filtered.slice(start, start+pageSize)

  const PageBtn = ({p})=>(
    <button
      onClick={()=>setPage(p)}
      className={`h-9 w-9 rounded-lg cursor-pointer text-sm ${p===pageSafe?'bg-indigo-600 text-white':'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
    >{String(p).padStart(2,'0')}</button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br  from-slate-50 via-indigo-50 to-purple-50">
      {/* Top header */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/60 border-b border-indigo-100">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">IT</div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Interview Tracker</h1>
              <p className="text-xs text-slate-500">Track calls, rounds, CTC and status</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <input
                value={query}
                onChange={e=>{ setQuery(e.target.value); setPage(1) }}
                className={tw.input + ' pl-9 w-64'}
                placeholder="Search company, role, HR..."
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
            </div>

            <select
              className={tw.select + ' w-44'}
              value={statusFilter}
              onChange={e=>{ setStatusFilter(e.target.value); setPage(1) }}
            >
              <option>All</option>
              <option>In Progress</option>
              <option>Selected</option>
              <option>Rejected</option>
              <option>Awaiting</option>
            </select>

            <button className={tw.btnGhost} onClick={()=>window.print()}>
              <span>Export</span>
            </button>

            {/* Primary CTA: Add Interview (opens form modal) */}
            <button className={tw.btnPrimary} onClick={openCreate}>
              <svg className="h-5 cursor-pointer  w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12"/>
              </svg>
              <span>Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <div className="relative flex-1">
            <input value={query} onChange={e=>{ setQuery(e.target.value); setPage(1) }} className={tw.input + ' pl-9'} placeholder="Search..." />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
            </svg>
          </div>
          <select className={tw.select + ' w-[46%]'} value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(1) }}>
            <option>All</option><option>In Progress</option><option>Selected</option><option>Rejected</option><option>Awaiting</option>
          </select>
          <button className={tw.btnPrimary }  onClick={openCreate}>+ Interview</button>
        </div>

        {/* Table card */}
        <div className={tw.card + ' p-4 md:p-6'}>
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">📋</div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-800">All Interview Records</h3>
            </div>
            <div className="text-xs md:text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{list.length} total</div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
              </svg>
              <span className="ml-3 text-gray-600">Loading records...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-gray-600 border-b">
                    <tr>
                      <th className="py-2 px-1 font-semibold text-xs">Sl. No.</th>
                      <th className="py-2 px-1 font-semibold text-xs">Date</th>
                      <th className="py-2 px-1 font-semibold text-xs">Company</th>
                      <th className="py-2 px-1 font-semibold text-xs">HR</th>
                      <th className="py-2 px-1 font-semibold text-xs">Contact</th>
                      <th className="py-2 px-1 font-semibold text-xs">Role</th>
                      <th className="py-2 px-1 font-semibold text-xs">Location</th>
                      <th className="py-2 px-1 font-semibold text-xs">Rounds</th>
                      <th className="py-2 px-1 font-semibold text-xs">Mode</th>
                      <th className="py-2 px-1 font-semibold text-xs">CTC</th>
                      <th className="py-2 px-1 font-semibold text-xs">Status</th>
                      <th className="py-2 px-1 font-semibold text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length===0 ? (
                      <tr>
                        <td colSpan={12} className="py-16 text-center text-gray-500">
                          No interviews found. Use “Interview” to add one.
                        </td>
                      </tr>
                    ) : rows.map((item, idx)=>(
                      <tr key={item._id || idx} className={`border-b ${idx%2 ? 'bg-gray-50/60' : 'bg-white'}`}>
                        <td className="py-2 px-1 font-medium text-gray-900 text-xs">
                          {start + idx + 1}
                        </td>
                        <td className="py-2 px-1 font-medium text-gray-900 text-xs">
                          {item.date ? new Date(item.date).toLocaleString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}
                        </td>
                        <td className="py-2 px-1">
                          <div className="flex items-center gap-1">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                              {(item.companyName||'?').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-xs">{item.companyName}</span>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.hrName}</td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.hrContact}</td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.role}</td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.location}</td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.rounds}</td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.interviewMode}</td>
                        <td className="py-2 px-1 text-gray-700 text-xs">{item.offeredCTC}</td>
                        <td className="py-2 px-1">
                          <span className={statusChip(item.status)}>{item.status || 'N/A'}</span>
                        </td>
                        <td className="py-2 px-1">
                          <div className="flex gap-1 justify-end">
                            <button className={tw.btnSoft + ' text-xs cursor-pointer  px-2 py-1'} onClick={()=>openView(item)}>View</button>
                            <button className={tw.btnWarn + ' text-xs cursor-pointer  px-2 py-1'} onClick={()=>openEdit(item)}>Edit</button>
                            <button className={tw.btnDanger + ' text-xs cursor-pointer  px-2 py-1'} onClick={()=>onDelete(item._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows:</span>
                  <select className={tw.select + ' w-24'} value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1) }}>
                    {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className={tw.btnGhost} onClick={()=>setPage(Math.max(1,pageSafe-1))}>Previous</button>
                  <div className="flex items-center gap-1">
                    {Array.from({length: totalPages}).slice(0,6).map((_,i)=><PageBtn key={i} p={i+1}/>)}
                    {totalPages>6 && <span className="px-2">…</span>}
                    {totalPages>6 && <PageBtn p={totalPages}/>}
                  </div>
                  <button className={tw.btnGhost} onClick={()=>setPage(Math.min(totalPages,pageSafe+1))}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Add button (mobile/desktop) */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center md:hidden"
        aria-label="Add Interview"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12"/>
        </svg>
      </button>

      {/* FORM MODAL (Add/Edit) */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-3"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-5xl w-full md:rounded-3xl md:overflow-hidden"
            >
              <div className="bg-white">
                <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">+</div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-800">{editingId ? 'Edit Interview' : 'Add Interview'}</h2>
                  </div>
                  <button className={tw.btnGhost} onClick={()=>{ setFormOpen(false); resetForm() }}>Close</button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-5 md:mx-8 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={onSubmit} className="px-5 md:px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Basic */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100"
                  >
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Date</label>
                        <input name="date" type="datetime-local" value={form.date} onChange={onChange} className={tw.input} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 font-medium">Company Name</label>
                        <input name="companyName" value={form.companyName} onChange={onChange} className={tw.input} placeholder="Company" />
                      </div>
                    </div>
                  </motion.section>

                  {/* Contact & Role */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100"
                  >
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact & Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium">HR Name</label>
                        <input name="hrName" value={form.hrName} onChange={onChange} className={tw.input} placeholder="HR Name" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">HR Contact</label>
                        <input name="hrContact" value={form.hrContact} onChange={onChange} className={tw.input} placeholder="+91..." />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Role</label>
                        <input name="role" value={form.role} onChange={onChange} className={tw.input} placeholder="MERN Developer" />
                      </div>
                    </div>
                  </motion.section>

                  {/* Interview */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100"
                  >
                    <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Interview Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Location</label>
                        <input name="location" value={form.location} onChange={onChange} className={tw.input} placeholder="WFH/On-site" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Rounds</label>
                        <input name="rounds" value={form.rounds} onChange={onChange} className={tw.input} placeholder="3" />
                      </div>
                      {/* <div>
                        <label className="text-sm text-gray-700 font-medium">Interview Mode</label>
                        <input name="interviewMode" value={form.interviewMode} onChange={onChange} className={tw.input} placeholder="Zoom/Phone" />
                      </div> */}
                    </div>
                  </motion.section>

                  {/* Offer & Next */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100"
                  >
                    <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Offer & Next Steps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 font-medium">Offered CTC</label>
                        <input name="offeredCTC" value={form.offeredCTC} onChange={onChange} className={tw.input} placeholder="₹5.5 LPA" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Next Step</label>
                        <input name="nextStep" value={form.nextStep} onChange={onChange} className={tw.input} placeholder="Follow-up email" />
                      </div>
                    </div>
                  </motion.section>

                  {/* Discussion & Remarks */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100"
                  >
                    <h3 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Discussion & Remarks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 font-medium">Discussion</label>
                        <textarea name="discussion" value={form.discussion} onChange={onChange} className={tw.textarea} placeholder="Summary of discussion..." />
                      </div>
                      <div className="">
                        <label className="text-sm text-gray-700 font-medium">Status</label>
                        <select name="status" value={form.status} onChange={onChange} className={tw.select}>
                          <option value="">Select Status</option>
                          <option>In Progress</option>
                          <option>Selected</option>
                          <option>Rejected</option>
                          <option>Awaiting</option>
                        </select>
                        <label className="text-sm text-gray-700 mt-3 block font-medium">Remarks</label>
                        <textarea name="remarks" value={form.remarks} onChange={onChange} className={tw.textarea} placeholder="Behavior / notes..." />
                      </div>
                    </div>
                  </motion.section>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-end gap-3 pt-2"
                  >
                    <button type="button" className={tw.btnGhost} onClick={resetForm}>Reset</button>
                    <button type="submit" className={tw.btnPrimary} disabled={loading}>
                      {loading ? 'Processing...' : (editingId ? 'Update Record' : 'Save Interview')}
                    </button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {viewOpen && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-3"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-5xl w-full md:rounded-3xl md:overflow-hidden"
            >
              <div className="bg-white">
                <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">👁️</div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-800">Interview Details</h2>
                  </div>
                  <button className={tw.btnGhost} onClick={()=>setViewOpen(false)}>Close</button>
                </div>
                <div className="px-5 md:px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Basic */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100"
                  >
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Date</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.date ? new Date(current.date).toLocaleString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Company Name</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.companyName}</div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Contact & Role */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100"
                  >
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Contact & Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium">HR Name</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.hrName}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">HR Contact</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.hrContact}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Role</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.role}</div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Interview */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100"
                  >
                    <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Interview Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Location</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.location}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Rounds</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.rounds}</div>
                      </div>
                      {/* <div>
                        <label className="text-sm text-gray-700 font-medium">Interview Mode</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.interviewMode}</div>
                      </div> */}
                    </div>
                  </motion.section>

                  {/* Offer & Next */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100"
                  >
                    <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Offer & Next Steps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 font-medium">Offered CTC</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.offeredCTC}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Next Step</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl">{current.nextStep}</div>
                      </div>
                    </div>
                  </motion.section>

                  {/* Discussion & Remarks */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-100"
                  >
                    <h3 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Discussion & Remarks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-700 font-medium">Discussion</label>
                        <div className="mt-1 p-3 bg-white border border-gray-200 rounded-xl h-28 overflow-y-auto">{current.discussion || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-medium">Status</label>
                        <div className="mt-1 p-2 bg-white border border-gray-200 rounded-xl flex items-center">
                          <span className={statusChip(current.status)}>{current.status || 'N/A'}</span>
                        </div>
                        <label className="text-sm text-gray-700 mt-3 block font-medium">Remarks</label>
                        <div className="mt-1 p-3 bg-white border border-gray-200 rounded-xl h-28 overflow-y-auto">{current.remarks || 'N/A'}</div>
                      </div>
                    </div>
                  </motion.section>
                </div>
                <div className="px-5 md:px-8 py-4 border-t flex justify-end gap-3">
                  <button className={tw.btnWarn} onClick={()=>{ setViewOpen(false); openEdit(current) }}>Edit</button>
                  <button className={tw.btnGhost} onClick={()=>setViewOpen(false)}>Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
