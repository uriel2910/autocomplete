ANSWERS

---

1.- The main difference between a Component and a PureComponent is the way in wich updates and re-renderings are handled, this go hand in hand with the sholdComponentUpdate method since a Component does not use it by default and a PureCompoent does with a shallow comparison for prop and state. This means that it only re-renders if the new props or state are different from the previous ones based on a shallow comparison.

Example where PureComponent might break

import React from 'react';

class RegularComponent extends React.Component {
render() {
console.log('RegularComponent rendered');
return <div>{this.props.data.name}</div>;
}
}

class PureComponentExample extends React.PureComponent {
render() {
console.log('PureComponent rendered');
return <div>{this.props.data.name}</div>;
}
}

export default function App() {
const [data, setData] = React.useState({ name: 'Alice' });

const updateName = () => {
data.name = 'Bob';
}
return (

<div>
<button onClick={updateName}>Change Name</button>
<RegularComponent data={data} />
<PureComponentExample data={data} />
</div>
);
};

---

2.- Components tha use Context do not depend directly on context switches through props or state. Therefore, even if the context value changes, shouldComponentUpdate will not detect it, since shouldComponentUpdate is only triggered by shallow comparison of props or state.

That said, if a child component depends on the Context and shouldComponentUpdate is implemented incorrectly, it can block re-renders, leading to the component not responding to changes in the context, breaking its behavior.

---

3.- Pass information from a component to its parent
a> callback function as prop:

Example
const ParentComponent = () => {
const [childData, setChildData] = useState('');
const handleDataFromChild = (data) => {
setChildData(data);
};
return <ChildComponent sendDataToParent={handleDataFromChild} />;
}

const ChildComponent = ({ sendDataToParent }) => {
return <button onClick={() => sendDataToParent('Some Data')}>Send Data</button>;
}

b> Lifting state up

Example
const ParentComponent = () => {
const [childData, setChildData] = useState('');
return <ChildComponent setValue={setChildData} />;
}

const ChildComponent = (setValue: React.Dispatch<React.SetStateAction<string>>) => {
return <button onClick={() => setValue('Some Data')}>Send Data</button>;
}

c> Using Context: Context can also be used as a global state-sharing mechanism. A parent component can provide the context, and a child can update the context value by calling functions made available through that context.

---

4.- prevent components for re-rendering
a> React.memo()
b> shouldComponentUpdate() or PureComponent

---

5.- A fragment (<React.Fragment> or <>) allows you to return multiple elements without adding extra nodes to the DOM. Fragments help keep the DOM structure cleaner by avoiding extra <div> or <span> elements. It's useful for cases where a component returns adjacent JSX elements.

Example where it might break the app:

<>
  <tr><td>Row 1</td></tr>
  <tr><td>Row 2</td></tr>
</>
Returning this from a compoent

---

6.- HOC pattern
a> withRouter: Adds routing props to a component, like history, location, and match.
b> withAuth: Wraps a component to provide authentication context or protect routes based on authentication status.
c> withLoading: Adds a loading indicator while data is being fetched in the background.

---

7.- Difference in handling exceptions
a> Promises: Errors are handled using .catch() at the end of the chain.
b> Callbacks: Errors are typically handled in the callback function itself, often as the first argument.
c> Async/Await: Errors are handled using try...catch blocks, making the code look synchronous and more readable.

---

8.- setState takes two arguments:
a> The new state or a function that returns the new state.
b> An optional callback function to be executed once the state has been updated.

Is async for performance reasons

9.- Class to Function Component
a> Remove the class definition and change it to a function.
b> Replace lifecycle methods like componentDidMount with useEffect.
c> Replace this.state and this.setState with useState.
d> Replace any method bindings with standard function definitions inside the function body.
e> Use useContext instead of contextType.

10.- styles in components
a> Inline styles
b> Importing traditional .css files in the component (className).
c> Using libraries like Emotion

11.- with dangerouslySetInnerHTML

Example

<div dangerouslySetInnerHTML={{ __html: someHtmlString }} />

