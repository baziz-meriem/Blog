import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; 

interface Content {
  id: number;
  title: string;
  desc: string;
  status: string;
  contentType: string;
  dateCreated?: string;
  dateUpdated?: string;
  url: string;
}

interface PaginatedResponse {
  content: Content[];
  totalPages: number;
  totalElements: number;
  number: number; // current page number
  size: number; // page size
}

const App: React.FC = () => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [formData, setFormData] = useState<Content>({
    id: -1,
    title: '',
    desc: '',
    status: '',
    contentType: '',
    url: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [nextId, setNextId] = useState<number>(1); // Track the next ID

  const apiUrl = 'http://localhost:8080/api/content';

  // Fetch content data based on current page
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Fetch content data
  const fetchData = (page: number) => {
    axios.get<PaginatedResponse>(`${apiUrl}?pageNumber=${page}&pageSize=2`) // Adjust size as needed
      .then((response) => {
        setContentList(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit for creating/updating content
  const handleSubmit = () => {
    if (isEditing) {
      axios.put(`${apiUrl}/${formData.id}`, formData)
        .then(() => {
          fetchData(currentPage); // Refresh data
          resetForm();
        })
        .catch((error) => console.error('Error updating content:', error));
    } else {
      const newContent = { ...formData, id: nextId };
      axios.post(apiUrl, newContent)
        .then(() => {
          // Optionally handle pagination or fetch data after creation
          fetchData(0); // Fetch first page to include the new item
          resetForm();
        })
        .catch((error) => console.error('Error creating content:', error));
        setNextId(nextId + 1);
    }
  };

  // Handle delete content
  const handleDelete = (id: number) => {
    axios.delete(`${apiUrl}/${id}`)
      .then(() => fetchData(currentPage))
      .catch((error) => console.error('Error deleting content:', error));
  };

  // Handle edit content
  const handleEdit = (content: Content) => {
    setFormData(content);
    setIsEditing(true);
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({ id: 0, title: '', desc: '', status: '', contentType: '', url: '' });
    setIsEditing(false);
  };

  return (
    <>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Management</h1>
  
      {/* Form for creating/updating content */}
      <div className="mb-4">
        <input
          className="border p-2 mr-2 mb-2"
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        <input
          className="border p-2 mr-2 mb-2"
          type="text"
          name="desc"
          placeholder="Description"
          value={formData.desc}
          onChange={handleChange}
        />
        <input
          className="border p-2 mr-2 mb-2"
          type="text"
          name="status"
          placeholder="Status"
          value={formData.status}
          onChange={handleChange}
        />
        <input
          className="border p-2 mr-2 mb-2"
          type="text"
          name="contentType"
          placeholder="Content Type"
          value={formData.contentType}
          onChange={handleChange}
        />
        <input
          className="border p-2 mr-2 mb-2"
          type="text"
          name="url"
          placeholder="URL"
          value={formData.url}
          onChange={handleChange}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          {isEditing ? 'Update Content' : 'Create Content'}
        </button>
      </div>
  
      {/* Display content list */}
      <ul className="list-disc pl-5">
        {contentList.map((content) => (
          <li key={content.id} className="mb-4 p-4 border rounded">
            <h3 className="text-xl font-semibold">{content.title}</h3>
            <p>{content.desc}</p>
            <p>{content.status} | {content.contentType}</p>
            <p>{content.url}</p>
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
              onClick={() => handleEdit(content)}
            >
              Edit
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => handleDelete(content.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
  
      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span className="text-lg">Page {currentPage + 1} of {totalPages}</span>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
    </>
  );
};

export default App;
