const Task = require('../models/task')
const express = require('express')
const auth = require('../middlewares/auth')
const router = new express.Router()

//creating new tasks

router.post('/Tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    console.log(req.user)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//fetching new tasks

router.get('/Tasks', auth, async (req, res) => {
    match = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    sort = {}
    if (req.query.sortBy) {
        const part = req.query.sortBy.split(':')
        sort[part[0]] = part[1] === 'desc' ? -1 : 1
    }
    try {

        //const task = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'task',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.task)
    } catch (e) {
        res.status(500).send(e)
    }

})

//fetching specific tasks

router.get('/task/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)

    } catch (e) {
        res.status(404).send(e)
    }
})

// Updating specific tasks

router.patch('/task/:id', auth, async (req, res) => {
    const _id = req.params.id


    const allowedTasks = ['description', 'completed']
    const tupdates = Object.keys(req.body)

    const updateT = tupdates.every((update) => allowedTasks.includes(update))
    if (!updateT) {
        res.status(400).send('unavailable updates')
    }
    try {
        // const updateTask = await Task.req.params.id
        const updateTask = await Task.findOne({ _id, owner: req.user._id })


        // const updateTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!updateTask) {
            return res.status(404).send()
        }
        tupdates.forEach((update) => updateTask[update] = req.body[update])
        await updateTask.save()
        res.send(updateTask)

    } catch (e) {
        res.status(400).send()

    }

})

//Deleting specific task

router.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

module.exports = router
