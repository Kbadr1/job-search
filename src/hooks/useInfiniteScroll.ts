
import  { MutableRefObject, useEffect } from 'react' 
import { fetchJobs } from '../store/jobs/thunks/fetchJobs';
import { setCursor } from '../store/jobs/jobsSlice';
import { AppDispatch } from '../store';

interface TUseInfiniteScroll  {
  next: number;
  loading: boolean;
  dispatch: AppDispatch;
  loaderRef:  MutableRefObject<null>;
  cursor: number;
}

export const useInfiniteScroll = ({ next, loading, dispatch, loaderRef, cursor } : TUseInfiniteScroll ) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          if (next) {
            dispatch(setCursor(next));
            dispatch(fetchJobs());
          } else {
            observer.unobserve(entries[0].target);
          }
        }
      },
      {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [dispatch, loading, cursor, next]);
}
