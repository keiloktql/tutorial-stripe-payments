import React from 'react'
import Spinner from 'react-bootstrap/Spinner';

const Loading = () => {
    return (
        <div className="c-Loading">
            <Spinner animation="border" role="status" variant="secondary"/>
            <p>Loading</p>
        </div>
    )
}

export default Loading;