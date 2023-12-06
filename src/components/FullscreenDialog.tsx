import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Dispatch, FC, SetStateAction, forwardRef, useState } from 'react';
import { Picture } from '../types/types';
import { CDN_URL } from '../constants';

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

type DialogProps = {
    picture: Picture,
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

export const FullScreenDialog: FC<DialogProps> = ({ picture, open, setOpen }) => {


    const handleClose = () => {
        console.log("CLOSE. IsOPEN:", open)
        setOpen((prev) => !prev);
    };

    const imageSRC = (picture.key.split(".jpg").length == 2) ? CDN_URL + picture.key : picture.key


    return (
        <React.Fragment>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Picture {picture.day}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <List className="fullscreen_container">
                    <img src={imageSRC} width={"100%"} />
                </List>
            </Dialog>
        </React.Fragment>
    );
}
export default FullScreenDialog