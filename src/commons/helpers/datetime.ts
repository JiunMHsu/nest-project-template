export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const _date: Date = new Date(date);
    return _date.toISOString().split('T')[0];
};

// TODO: Adapt fort date object
export const formatTime = (date: string): string => {
    return new Date(date).toISOString().split('T')[1].split('.')[0];
};
