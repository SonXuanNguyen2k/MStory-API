import { NextFunction, Request, RequestHandler, Response } from "express";
import Joi from "joi";
import { EntityTarget, getRepository, Repository } from "typeorm";

export const asyncHandler = (asyncFn: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) => Promise.resolve(asyncFn(req, res, next)).catch(next)

export const checkID = (urlParamDocID: 'projectID' | 'storyID') =>
    (req: Request, res: Response, next: NextFunction) => {
        const { error } = Joi.string().length(26).required().validate(req.params[urlParamDocID])
        if (error) return next(error)
        next()
    }

// Generic controller to delete the Entity document
export const deleteEntityDoc = <Entity>(entityClass: EntityTarget<Entity>, urlParamDocID: 'projectID' | 'storyID') =>
    async (req: Request, res: Response) => {
        const entityRepo = getRepository(entityClass)
        const foundDoc = await findEntityDocByID(entityRepo, req.params[urlParamDocID])
        await entityRepo.remove(foundDoc)
        res.status(200).json({ message: "Document has been deleted successfully" })
    }

// Find a doc within a particular repo
export const findEntityDocByID = async <Entity>(entityRepo: Repository<Entity>, docID: string) => {
    const doc = await entityRepo.findOne(docID)
    if (!doc) return Promise.reject("No document with the given ID is found")
    return doc
}

export const omit = (obj: Object, keys: string[]) =>
    transform(obj, (_value, key) => !keys.includes(key))

export const pick = (obj: Object, keys: string[]) =>
    transform(obj, (_value, key) => keys.includes(key))

const transform = (obj: Object, predicate: (value: any, key: string) => boolean) => {
    return Object.keys(obj).reduce((memo: Object, key: string) => {
        // @ts-ignore
        if (predicate(obj[key], key)) memo[key] = obj[key]
        return memo
    }, {})
}
