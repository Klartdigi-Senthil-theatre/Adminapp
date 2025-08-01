// components/PageHeader.jsx
const PageHeader = ({ title, className = "" }) => {
    return (
        <h1 className={`text-xl lg:text-2xl font-semibold ${className}`}>
            {title}
        </h1>
    );
};

export default PageHeader;