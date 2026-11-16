import api from './api';

export const getRequests = async (filters: any): Promise<any[]> => {
    const response = await api.get('/requests', { params: filters });
    return response.data;
}

export const createRequest = async (requestData: any): Promise<any> => {
    const response = await api.post('/requests', requestData);
    return response.data;
}