import { BlocklyUi } from "./BlocklyUi";
import * as React from "react";
import { Field } from "./schema/Field";
import { CssBaseline, Typography, Dialog, Button, IconButton, AppBar, Toolbar, Grid, Box, Container, List, ListItem, ListItemText, Divider, createStyles, makeStyles, Theme } from "@material-ui/core";
import BuildIcon from '@material-ui/icons/Build';
import CloseIcon from '@material-ui/icons/Close';

type AppProps = {
    sourceXml: string;
    fields: Field[];
}

type AppState = {
    showBlocklyEditor: boolean;
}

export class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = { showBlocklyEditor: false };

        this.handleToggleEditor = this.handleToggleEditor.bind(this);
        this.handleCloseEditor = this.handleCloseEditor.bind(this);
    }

    handleToggleEditor() {
        this.setState({ showBlocklyEditor: !this.state.showBlocklyEditor });
    }

    handleCloseEditor() {
        this.setState({ showBlocklyEditor: false });
    }

    render() {
        return (
            <React.Fragment>
                <IconButton edge="start" color="inherit" onClick={this.handleToggleEditor} aria-label="open blockly">
                    <BuildIcon >open blockly</BuildIcon>
                </IconButton>
                <Dialog maxWidth={'xl'} open={this.state.showBlocklyEditor} onClose={this.handleCloseEditor}>
                    <AppBar style={{ position: 'relative' }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={this.handleCloseEditor} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Box flex={1}>
                                <Typography variant="h6">KintoneBlockly</Typography>
                            </Box>
                        </Toolbar>
                    </AppBar>
                    <BlocklyUi
                        visible={true}
                        handleToggleEditor={this.handleToggleEditor}
                        sourceXml={this.props.sourceXml}
                        fields={this.props.fields}
                    />
                </Dialog>
            </React.Fragment>
        );
    }
}
