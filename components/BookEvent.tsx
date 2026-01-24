'use client';

import { useState } from "react"

const BookEvent = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Think you for signing up !</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Adress</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} name="email" id="email" placeholder="Enter your Email adress" />
                    </div>
                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}
        </div>
    )
}

export default BookEvent