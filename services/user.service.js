import fs from 'fs'
import path from 'path'
import { utilService } from '../public/services/util.service.js'

const usersPath = path.resolve('data/user.json')

export const userService = {
    query,
    getById,
    getByUsername,
    add
}

function query() {
    return new Promise((resolve, reject) => {
        fs.readFile(usersPath, 'utf-8', (err, data) => {
            if (err) return reject('Failed to read user file: ' + err.message)

            let users
            try {
                users = JSON.parse(data)
            } catch (parseErr) {
                return reject('Failed to parse user data: ' + parseErr.message)
            }

            if (!Array.isArray(users)) return reject('User data is not an array')

            const cleanUsers = users.map(u => ({ _id: u._id, fullname: u.fullname }))
            resolve(cleanUsers)
        })
    })
}

function getById(userId) {
    return new Promise((resolve, reject) => {
        fs.readFile(usersPath, 'utf-8', (err, data) => {
            if (err) return reject('Failed to read user file: ' + err.message)

            let users
            try {
                users = JSON.parse(data)
            } catch (parseErr) {
                return reject('Failed to parse user data: ' + parseErr.message)
            }

            const user = users.find(u => u._id === userId)
            if (!user) return reject('User not found')

            const cleanUser = { ...user }
            delete cleanUser.password
            resolve(cleanUser)
        })
    })
}

function getByUsername(username) {
    return new Promise((resolve, reject) => {
        fs.readFile(usersPath, 'utf-8', (err, data) => {
            if (err) return reject('Failed to read user file: ' + err.message)

            let users
            try {
                users = JSON.parse(data)
            } catch (parseErr) {
                return reject('Failed to parse user data: ' + parseErr.message)
            }

            const user = users.find(u => u.username === username)
            resolve(user)
        })
    })
}

function add(user) {
    return getByUsername(user.username).then(existing => {
        if (existing) return Promise.reject('Username taken')

        return new Promise((resolve, reject) => {
            fs.readFile(usersPath, 'utf-8', (err, data) => {
                if (err) return reject('Failed to read user file: ' + err.message)

                let users
                try {
                    users = JSON.parse(data)
                } catch (parseErr) {
                    return reject('Failed to parse user data: ' + parseErr.message)
                }

                user._id = utilService.makeId()
                users.push(user)

                fs.writeFile(usersPath, JSON.stringify(users, null, 2), err => {
                    if (err) return reject('Failed to save user: ' + err.message)

                    const cleanUser = { ...user }
                    delete cleanUser.password
                    resolve(cleanUser)
                })
            })
        })
    })
}
