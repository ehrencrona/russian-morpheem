
import { Component, createElement } from 'react'

interface Props {
    children?: any
    onClose: () => any
}

interface State {}

let React = { createElement: createElement }

export default function overlayComponent(props: Props) {
    return <div className='overlayContainer' onClick={ props.onClose }>
        <div className='overlay'>
            { props.children }
        </div>
    </div>
}