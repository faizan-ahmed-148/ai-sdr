import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        // Always show first page
        pages.push(1);
        
        // Determine range of pages to show around current page
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        
        // Adjust if we're near the start or end
        if (currentPage <= 3) {
            endPage = Math.min(4, totalPages - 1);
        } else if (currentPage >= totalPages - 2) {
            startPage = Math.max(totalPages - 3, 2);
        }
        
        // Add ellipsis if needed after first page
        if (startPage > 2) {
            pages.push('...');
        }
        
        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        // Add ellipsis if needed before last page
        if (endPage < totalPages - 1) {
            pages.push('...');
        }
        
        // Always show last page if there's more than one page
        if (totalPages > 1) {
            pages.push(totalPages);
        }
        
        return pages;
    };

    return (
        <div className={`flex items-center justify-center space-x-1 ${className}`}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
                Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span className="px-3 py-1">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;