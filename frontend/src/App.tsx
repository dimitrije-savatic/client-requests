import { useEffect, useState } from 'react'
import './App.css'
import { getRequests } from './services/requestService'
import { getClients } from './services/clientService';

function App() {
  const [requests, setRequests] = useState<any>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(true);
  const [error, setError] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [searchTerm, setSearchTerm] = useState({
    client_id: '',
    status: '',
    priority: '',
    q: ''
  });
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    status: 'open',
    priority: 'low',
    due_date: '',
    resolution: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchClients();
  }, [searchTerm]);

  const fetchRequests = async () => {
    try {
      const data = await getRequests(searchTerm);
      setRequests(data);
    } catch (error) {
      setError(['Failed to fetch requests.']);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      setError(['Failed to fetch clients.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: any, value: any) => {
    setSearchTerm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setError([]);

    try {
      const response = await fetch('http://localhost:8000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.status == 422) {
        setError(Object.values(data.errors).flat() as string[]);
        console.log('Validation errors:', data.errors);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create request.');
      }

      console.log('Request created successfully.', data);

      setFormData({
        client_id: '',
        title: '',
        description: '',
        status: 'open',
        priority: '',
        due_date: '',
        resolution: ''
      });

    } catch (error: any) {
      setError(['Server connection failed.']);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditRequest = async (id: number, status: string, resolution?: string) => {
    const response = await fetch('http://localhost:8000/api/requests/' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ status: status, resolution: resolution }),
    })
    if (response.ok) {
      await fetchRequests();
    }

    if (!response.ok) {
      const data = await response.json();
      setError([data.error?.details || 'Failed to update request.']);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col h-screen items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="flex w-full flex-col lg:flex-row justify-center">
            <div className="flex flex-row justify-around w-full rounded-lg bg-white p-1 pb-6 text-[13px] leading-5 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:p-10 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
              <div className="flex flex-col w-2/3 items-start justify-center px-1">
                <h1 className="mb-3 font-medium">
                  Client Requests
                </h1>
                <div id='search' className="flex w-full flex-row justify-between items-center">
                  <input type="text" placeholder="Search..." value={searchTerm.q} onChange={(e) => handleFilterChange('q', e.target.value)} className="w-1/2 mb-3 rounded-md border border-[#A1A09A] bg-[#0a0a0a] px-3 py-2 text-white placeholder:text-[#A1A09A]" />
                  <label htmlFor="status-filter" className="mx-2 text-white">Status:</label>
                  <select id="status-filter" value={searchTerm.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="mr-3 bg-[#0a0a0a] text-white">
                    <option value="">All</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <label htmlFor="priority-filter" className="mr-2 text-white">Priority:</label>
                  <select id="priority-filter" value={searchTerm.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="mr-3  bg-[#0a0a0a] text-white">
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <label htmlFor="client-filter" className="mr-2 text-white">Client:</label>
                  <select id="client-filter" value={searchTerm.client_id} onChange={(e) => handleFilterChange('client_id', e.target.value)} className="mr-3  bg-[#0a0a0a] text-white">
                    <option value="">Any</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <p className="mb-5">
                  <span className="mr-2 rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white">
                    open: {requests.summary?.open}
                  </span>
                  <span className="mr-2 rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white">
                    in progress: {requests.summary?.in_progress}
                  </span>
                  <span className="mr-2 rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white">
                    done: {requests.summary?.done}
                  </span>
                </p>
                <div className="w-full h-[500px] overflow-y-auto overflow-x-auto rounded-xl border border-[#A1A09A] bg-[#0a0a0a]">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-[#A1A09A] bg-[#161615]">
                      <tr className="text-[#A1A09A]">
                        <th className="pl-5 px-2 py-4 font-medium">Client</th>
                        <th className="px-2 py-4 font-medium">Title</th>
                        <th className="px-2 py-4 font-medium">Status</th>
                        <th className="px-2 py-4 font-medium">Priority</th>
                        <th className="px-2 py-4 font-medium">Due date</th>
                        <th className="px-2 py-4 font-medium">Resolution</th>
                        <th className="px-2 py-4 font-medium">Description</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#A1A09A] text-white">
                      {requests.data.map((request: any) => (
                        <tr key={request.id} className="transition-colors hover:bg-white/5">
                          <td className="pl-5 px-1 py-4">{request.client?.name}</td>
                          <td className="px-1 py-4 font-medium">{request.title}</td>
                          <td className="px-1 py-4 hover:cursor-pointer" onClick={() => {
                            setSelectedRequest(request);
                            setIsHidden(false);
                          }}>
                            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                              {request.status}
                            </span>
                          </td>
                          <td className="px-1 py-4 text-green-500">{request.priority}</td>
                          <td className="px-1 py-4 whitespace-nowrap">{request.due_date}</td>
                          <td className="px-1 py-4">{request.resolution ? request.resolution?.substring(0, 50) : ''}{request.resolution && request.resolution.length > 50 ? '...' : ''}</td>
                          <td className="px-1 py-4">{request.description ? request.description?.substring(0, 50) : ''}{request.description && request.description.length > 50 ? '...' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-col w-1/4">
                <form onSubmit={handleSubmit}>
                  {/*Title*/}
                  <div className="flex flex-col">
                    <label>Title</label>
                    <input type="text" name="title" className="bg-white w-full rounded-md my-2 text-black pl-1" value={formData.title} onChange={handleFormChange} required />
                  </div>

                  {/*Client*/}
                  <div className="flex flex-col">
                    <label>Client</label>
                    <select name="client_id" id="client"
                      className="bg-white w-full rounded-md my-2 text-black pl-1" value={formData.client_id} onChange={handleFormChange} required>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  {/*Description*/}
                  <div className="flex flex-col">
                    <label>Description</label>
                    <input type="text" name="description" className="bg-white w-full rounded-md my-2 text-black pl-1" value={formData.description} onChange={handleFormChange} required />
                  </div>

                  {/*Priority*/}
                  <div className="flex flex-col">
                    <label>Priority</label>
                    <div className="flex justify-evenly items-center">
                      <div>
                        <input type="radio" id="low" value="low" name="priority" checked={formData.priority === 'low'} onChange={handleFormChange} className="bg-white rounded-md my-2 mr-1 text-black" />
                        <label htmlFor="low">Low</label>
                      </div>
                      <div>
                        <input type="radio" id="medium" value="medium" name="priority" checked={formData.priority === 'medium'} onChange={handleFormChange} className="bg-white rounded-md my-2 mr-1 text-black" />
                        <label htmlFor="medium">Medium</label>
                      </div>
                      <div>
                        <input type="radio" id="high" value="high" name="priority" checked={formData.priority === 'high'} onChange={handleFormChange} className="bg-white rounded-md my-2 mr-1 text-black" />
                        <label htmlFor="high">High</label>
                      </div>
                    </div>
                  </div>

                  {/*Due date*/}
                  <div className="flex flex-col">
                    <label>Due Date</label>
                    <input type="date" name="due_date" className="bg-white w-full rounded-md my-2 text-black pl-1" value={formData.due_date} onChange={handleFormChange} />
                  </div>
                  {/*Resolution*/}
                  <div className="flex flex-col">
                    <label>Resolution</label>
                    <input type="text" name="resolution" className="bg-white w-full rounded-md my-2 text-black pl-1" value={formData.resolution} onChange={handleFormChange} required />
                  </div>
                  {error.length > 0 && (<div className="text-red-500 text-sm mb-3">{error.map((message, index) => (<p key={index}>{message}</p>))}</div>)}
                  <div className="flex justify-around pt-3">
                    <button type="submit" disabled={isLoading} className="p-0.5 bg-white w-20 text-black border-2 border-white rounded-md hover:cursor-pointer hover:border-orange-500">{isLoading ? 'Submitting...' : 'Submit'}</button>
                  </div>
                </form>
              </div>
            </div>
          </main >
        </div >
      </div >

      <div className={`${isHidden ? 'hidden' : 'fixed'} inset-0 z-50 flex items-center justify-center bg-black/40 px-4`}>

        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

          <div className="border-b border-[#D8D8D2] px-6 py-5">
            <h2 className="text-lg font-semibold">
              Edit request
            </h2>
          </div>

          <div className="p-6">

            <label className="mb-1.5 block text-sm font-medium">Status:</label>
            <select id="status-filter" value={selectedRequest?.status} onChange={(e) => setSelectedRequest({ ...selectedRequest, status: e.target.value })} className="w-full rounded-lg border border-[#D8D8D2] bg-[#FAFAF8] px-3 py-2.5 mb-1.5 text-sm outline-none focus:border-green-500">
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <label className="mb-1.5 block text-sm font-medium">
              Resolution
            </label>

            <textarea
              rows={5}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how the request was resolved..."
              className="w-full resize-none rounded-lg border border-[#D8D8D2] bg-[#FAFAF8] px-3 py-2.5 text-sm outline-none focus:border-green-500"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button className="rounded-lg border border-[#D8D8D2] px-4 py-2.5 text-sm font-medium hover:cursor-pointer" onClick={() => setIsHidden(true)}>
                Cancel
              </button>

              <button className="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:cursor-pointer" onClick={() => [handleEditRequest(selectedRequest.id, selectedRequest.status, resolution !== '' ? resolution : undefined), setIsHidden(true)]}>
                Mark as done
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default App
