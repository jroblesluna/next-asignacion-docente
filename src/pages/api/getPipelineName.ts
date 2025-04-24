import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const NamePipelineSync = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_SYNC_NAME || 'dummySync';
  const NamePipelineDelta = process.env.NEXT_PUBLIC_INVOKE_PIPELINE_NAME || 'dummyDelta';
  const NamePipelineUpdateDisponibility =
    process.env.NEXT_PUBLIC_INVOKE_PIPELINE_UPDATE_DIS || 'dummyUpdateDisponibility';
  res.status(200).json({
    NamePipelineSync,
    NamePipelineUpdateDisponibility,
    NamePipelineDelta,
  });
}
