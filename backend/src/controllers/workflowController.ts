import { Request, Response } from 'express';
import { workflowService } from '../services/workflowService';
import { WorkflowCreateSchema } from '../validators/workflow';

export const createWorkflow = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const input = WorkflowCreateSchema.parse(req.body);
  const wf = await workflowService.create(landlordId, input);
  res.status(201).json(wf);
};

export const getActiveWorkflow = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const wf = await workflowService.getActive(landlordId);
  res.json(wf);
};

export const getWorkflowById = async (req: Request, res: Response) => {
  const landlordId = req.user!.landlordId;
  const { id } = req.params;
  const wf = await workflowService.getById(landlordId, id);
  res.json(wf);
};
