import React, {Component} from "react";
import ReactDOM from "react-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faWindowClose, faExpandArrows} from '@fortawesome/free-solid-svg-icons'
import uuid from "uuid";
import "./App.scss";


class NodeForm extends Component {
    state = {id: 1};

    handleChange = (e) => {
        this.setState({id: Number(e.target.value)});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const a = {id: this.props.id};
        const b = {id: this.state.id};

        this.props.handleAddEdge(a, b);
        this.props.handleClose();
    };

    render()
    {
        return (
            <div className="node-form">
            <div className="node-form-close"
            onClick={this.props.handleClose}>
            <FontAwesomeIcon icon={faWindowClose}/>
            </div>
            <p>Form</p>
            <form onSubmit={this.handleSubmit}>
            <input name="id" type="text" 
            value={this.state.id} onChange={this.handleChange}/>
            <button name="submit" type="submit">Add</button>
            </form>
            </div>	
        );
    }
};

class EditableNode extends Component {
    state = {
        dragging: false,
        openForm: false
    };

    handleMouseDown = (e) => {
        window.addEventListener("mouseup", this.handleMouseUp);
        window.addEventListener("mousemove", this.handleMouseMove);

        switch (e.target.id) {
            case "drag": {
                this.setState({dragging: true});
            } break;
            case "set-prereqs": {
                this.setState({openForm: !this.state.openForm});
            } break;
            default: {
                return;
            }
        }
    }

    handleMouseUp = (e) => {
        window.removeEventListener("mouseup", this.handleMouseUp);
        window.removeEventListener("mousemove", this.handleMouseMove);
        this.setState({dragging: false});
    }

    handleMouseMove = ({clientX, clientY}) => {
        if (this.state.dragging) {
            const attrs = {
                id: this.props.id,
                x: clientX,
                y: clientY
            };
            this.props.handleUpdatePosition(attrs);
        } else {
            return;
        }
    }

    closeForm = () => {
        this.setState({openForm: false});
    }

    componentWillUnmount()
    {
        window.removeEventListener("mouseup", this.handleMouseUp);	
        window.removeEventListener("mousemove", this.handleMouseMove);
    }

    render()
    {
        const styles = {
            top: this.props.y, 
            left: this.props.x,
            width: this.props.w,
            height: this.props.h
        };

        if (this.state.openForm) {
            return (
                <div className="node" style={styles}>
                <div className="node-id">{this.props.id}</div>
                <div id="drag" className="action" 
                onMouseDown={this.handleMouseDown}>
                </div>
                <div id="set-prereqs" className="action" 
                onMouseDown={this.handleMouseDown}>
                </div>
                <NodeForm id={this.props.id}
                handleAddEdge={this.props.handleAddEdge}
                handleClose={this.closeForm}/>
                </div>
            );
        }

        return (
            <div className="node" style={styles}>
            <div className="node-id">{this.props.id}</div>
            <div id="drag" className="action" 
            onMouseDown={this.handleMouseDown}>
            </div>
            <div id="set-prereqs" className="action" 
            onMouseDown={this.handleMouseDown}>
            </div>
            </div>
        );
    }
};

class App extends Component {
    state = {nodes: []}

    addEdge = (a, b) => {
        this.setState({
            nodes: this.state.nodes.map((node) => {
                if (node.id === a.id) {
                    return Object.assign({}, node, {
                        adj: [...node.adj, b.id]
                    });
                } else if(node.id === b.id) {
                    return Object.assign({}, node, {
                        adj: [...node.adj, a.id]
                    });
                } else {
                    return node;
                }
            })
        });
    };

    updateNodePosition = (attrs) => {
        this.setState({
            nodes: this.state.nodes.map((node) => {
                if (node.id === attrs.id) {
                    return Object.assign({}, node, {
                        x: attrs.x, 
                        y: attrs.y
                    });
                } else {
                    return node;
                }
            })
        });
    }

    addNode = (e) => {
        const newNode = {
            id: this.state.nodes.length,
            x: e.clientX, y: e.clientY, 
            w: 100, h: 100,
            adj: []
        };

        this.setState({nodes: [...this.state.nodes, newNode]});
    }

    render()
    {
        const n = this.state.nodes;
        console.log(n);
        const lines = this.state.nodes.map((node, i) => {
            let ax = node.x;
            let ay = node.y;

            const adjs = node.adj.map((adj, j) => {
                console.log(j, node.adj[j]);
                let bx = n[node.adj[j]];
                let by = n[node.adj[j]];

                if (!bx || !by) return;

                bx = bx.x;
                by = by.y;

                if (ax > bx) {
                    bx = ax + bx;
                    ax = bx - ax;
                    bx = bx - ax;
                    by = ay + by;
                    ay = by - ay;
                    by = by - ay;
                }

                if (ax == bx || ay == by) return;

                const angle = -(Math.atan((ay-by) / (bx-ax)) * 180/Math.PI);
                const length = Math.sqrt((ax-bx) * (ax-bx) + (ay-by) * (ay-by));
                const styles = {
                    top: ay, 
                    left: ax, 
                    width: length, 
                    transform: `rotate(${angle}deg)`, 
                }

                return (
                    <div key={uuid.v4()} className="connection" 
                    style={styles}>
                    </div>);
            });
            return adjs;
        });

        const nodes = this.state.nodes.map((node, i) => (
            <EditableNode key={i} id={node.id}
            x={node.x - (node.w / 2)} 
            y={node.y - (node.h / 2)}
            w={node.w} h={node.h}
            handleUpdatePosition={this.updateNodePosition}
            handleAddEdge={this.addEdge}/>
        ));

        return (
            <div>
            <div className="graph-container">
            <div className="graph" onClick={this.addNode}></div>
            <div className="connections">{lines}</div>
            <div className="nodes">{nodes}</div>
            </div>
            </div>
        );
    }
};

ReactDOM.render(<App />, document.getElementById("app"));
