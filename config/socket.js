let io;
const setIo = (socketServer) => {
    io = socketServer;
};

const getIo = () => {
    if (!io) {
        throw new Error('socket.IO has ot been initialized');
    } 
    return io;
}
module.exports = { setIo, getIo };