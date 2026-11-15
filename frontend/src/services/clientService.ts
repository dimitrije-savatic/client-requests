import api from './api';

export const getClients = async (): Promise<any[]> => {
    const response = await api.get('/clients');
    return response.data;
}