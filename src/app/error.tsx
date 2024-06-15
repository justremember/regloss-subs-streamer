'use client' // Error components must be Client Components
 
import { useState, useEffect } from 'react'
 
export default function Error({
    error,
    reset,
}: {
        error: Error & { digest?: string }
        reset: () => void
}) {
    const [errorHandledMessage, setErrorHandledMessage] = useState("");
    useEffect(() => {
        async function handleError() {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_ERROR_REPORTING_SERVER || "",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            error: String(error),
                        }),
                    }
                );
                if (!response.ok) {
                    throw("Error reporting server returned code " + response.status);
                }
                setErrorHandledMessage("Successfully reported error");
            } catch (error) {
                setErrorHandledMessage("When trying to report the error, another error occured: " + String(error));
            }
        }
        handleError();
    }, [error])
 
    return (
        <div>
            <h2>Something went wrong!</h2>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
            <div>{errorHandledMessage}</div>
        </div>
    )
}