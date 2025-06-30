interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <div className=" p-4 pb-0 flex flex-wrap items-center justify-between gap-3 mb-2 ">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
{/*           
          <div className="text-sm text-gray-800 dark:text-white/90 mt-[10px]">
                  <BackButton buttonText="Back to Categories" newOnClick={navigate(`/menu/${1}`)}/>

          </div> */}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
